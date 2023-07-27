import cds from '@sap/cds';
import UserManagement from "./utils/user-management.js";

export default cds.service.impl(async function() {
    const { Users } = this.entities;

    // Scope check for local development
    if (cds.env.profiles.find( p =>  p.includes("hybrid") || p.includes("production"))) {
        this.before("SAVE", Users, async (req) => {
            try{
                let user = req.data;

                const { req : request } = cds.context.http
                const tenantHost = request.get('x-forwarded-host') ?? request.host;
                const tenantProto = request.get('x-forwarded-proto') ?? request.protocol;

                const userToken = request.authInfo.getTokenInfo().getTokenValue();
                const userManagement = new UserManagement(userToken);

                await userManagement.validateRoleCollection(req.data.role_ID);

                if (req.event !== 'UPDATE') {
                    let userInfo = await userManagement.createUser({
                        first_name: user.firstName,
                        last_name: user.lastName,
                        email: user.email,
                        target_url: `${tenantProto}://${tenantHost}`,
                        roleId: req.data.role_ID
                    })

                    req.data.iasLocation = userInfo?.iasLocation;
                    req.data.shadowId = userInfo.shadow.id;
                    
                    console.log("User successfully created!", JSON.stringify(userInfo));
                    req.notify(200, 'User successfully created!')
                } else {
                    let diff = await req.diff();

                    if (diff.ID) {
                        let users = await cds.run(SELECT.from("susaas.db.Users").where({ ID: diff.ID }));
                        await userManagement.removeRoleCollectionFromUser(users[0].role_ID, users[0].shadowId);
                        await userManagement.assignRoleCollectionToUser(req.data.role_ID, users[0].shadowId);

                        console.log("User successfully updated!");
                        req.notify(200, 'User successfully updated!')
                    }
                }
            } catch(error){
                console.error(`Error: An error occored while saving the user!`);
                console.error("Error: ", error.message);
                req.reject(500, error.message)
            }
        })
    }

    // Scope check for local development
    if (cds.env.profiles.find( p =>  p.includes("hybrid") || p.includes("production"))) {
        this.on("READ", 'Roles', async (req) => {
            try{
                const { req : request } = cds.context.http
                let loggedInUserToken = request.authInfo.getTokenInfo().getTokenValue()
                let userManagement = new UserManagement(loggedInUserToken);
                let pagination = {
                    startIndex: req.query.SELECT.limit.offset.val + 1,
                    count: req.query.SELECT.limit.rows.val + 1,
                    sortOrder: 'ascending',
                    sortBy: 'displayName'
                }
                let roleCollections = await userManagement.getRoleCollections("Susaas", pagination);
                let response = [];

                if (req.query.SELECT.count) {
                    response.$count = roleCollections.length
                }
                if (req.query.SELECT.search) {
                    let searchValue = req.query.SELECT.search[0].val;
                    roleCollections = roleCollections.filter((resource) => resource.id.includes(searchValue) || resource.description.includes(searchValue))
                }
                roleCollections.map((roleCollection) => {
                    response.push({ ID: roleCollection.id, description: roleCollection.description });
                })

                console.log("Role collections successfully read!");

                req.reply(response);
            }catch(error){
                console.error(`Error: An error occurred while reading the application roles!`);
                console.error("Error: ", error.message);
                req.reject(500, error.message)
            }
        })
    }

    // Scope check for local development
    if (cds.env.profiles.find( p =>  p.includes("hybrid") || p.includes("production"))) {
        this.before("DELETE", 'Users', async (req) => {
            try {
                const { req : request } = cds.context.http
                let loggedInUserToken = request.authInfo.getTokenInfo().getTokenValue();
                let userManagement = new UserManagement(loggedInUserToken);
                let user = await cds.run(SELECT.from("susaas.db.Users").where({ ID: req.data.ID }));

                await userManagement.deleteUser(user[0]);
                
                console.log("User successfully deleted!");
                req.notify(200, 'User successfully deleted!')
            }catch(error){
                console.error(`Error: An error occurred while deleting the user!`);
                console.error("Error: ", error.message);
                req.reject(500, error.message)
            }
        })
    }
});