import axios from 'axios';
import xsenv from '@sap/xsenv';
import https from 'https';

let xsuaa, ias = new Object();

if (cds.env.profiles.find( p =>  p.includes("hybrid") || p.includes("production"))) {
    xsuaa = xsenv.getServices({ xsuaa: { tag: 'xsuaa' }}).xsuaa;
    
    try{ 
        ias = xsenv.getServices({ ias: { label: 'identity' }}).ias;
    }catch(error){
        console.log("[cds] - IAS Binding is missing, therefore user management will not interact with any IAS instance");
    }
 
}

class UserManagement {
    
    constructor(token) {
        this.token = token;
        this.ias = this.#checkIASBinding();
    }

    async createUser(userInfo) {
        try {
            let createdUserInfo = new Object()
            
            await this.validateRoleCollection(userInfo.roleId);
            this.ias && (createdUserInfo.iasLocation = await this.createIASUser(userInfo))
            
            createdUserInfo.shadow = await this.createShadowUser(userInfo.first_name, userInfo.last_name, userInfo.email);
            await this.assignRoleCollectionToUser(userInfo.roleId, createdUserInfo.shadow.id);

            console.log("User successfully created and role collection assigned");
            return createdUserInfo;
        } catch (error) {
            console.error("Error: User creation cancelled for the user ", JSON.stringify(userInfo));
            console.error(`Error: ${error.message}`);
        }
    }

    async getShadowUsers() {
        try {
            let token = await this.token;
            let authOptions = {
                method: 'GET',
                url: xsuaa.apiurl + `/Users`,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };
            let response = await axios(authOptions);

            console.log("Shadow users successfully retrieved from subaccount.");
            return response.data;
        } catch (error) {
            console.error("Error: Shadow users can not be retrieved from subaccount.")
            throw error;
        }
    }

    async createShadowUser(firstName, lastName, email) {
        try {
            let body = {
                userName: email,
                externalId: email,
                origin: this.ias ? "sap.custom" : "sap.default",
                schemas: ["urn:scim:schemas:core:1.0"],
                name: {
                    givenName: firstName,
                    familyName: lastName
                },
                emails: [{
                    "type": "string",
                    "value": email,
                    "primary": true
                }]
            };
            let token = this.token;
            let authOptions = {
                method: 'POST',
                url: xsuaa.apiurl + `/Users`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                data: body
            };
            let response = await axios(authOptions);
           
            console.log(`Shadow user with email ${email} successfully created in subaccount.`);
            return response.data;
        } catch (error) {
            console.error(`Error: Shadow user with email ${email} can not be created in subaccount.`)
            throw error;
        }
    }

    async deleteShadowUser(id) {
        try {
            let token = this.token;
            let options = {
                method: 'DELETE',
                url: xsuaa.apiurl + `/Users/${id}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };
            let response = await axios(options);
            
            console.log(`Shadow user with ID ${id} has been deleted from subaccount.`)
            return response.data;
        } catch (error) {
            console.error(`Error: Shadow user with ID ${id} can not be deleted from subaccount.`)
            throw error;
        }
    }

    async createIASUser(userInfo) {
        try {
            let options = {
                method: 'POST',
                url: `${ias.url}/service/users`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                data: new URLSearchParams({ ...userInfo, name_id: userInfo.email }).toString(),
                httpsAgent: new https.Agent({
                    cert: ias.certificate,
                    key: ias.key
                })
            };
            let response = await axios(options);
            
            console.log(`User with email ${userInfo.email} has been created in SAP IAS.`)
            return response.headers.location;
        } catch (error) {
            console.error(`Error: User with email ${userInfo.email} can not be created SAP IAS.`)
            throw error;
        }
    }

    async deleteIASUser(location) {
        try {
            let options = {
                method: 'DELETE',
                url: location,
                headers: {
                    'Content-Type': 'application/vnd.sap-id-service.sp-user-id+xml',
                },
                httpsAgent: new https.Agent({
                    cert: ias.certificate,
                    key: ias.key
                })
            };
            
            await axios(options);
            console.log(`User ${location} successfully deleted from SAP IAS.`);
        } catch (error) {
            console.error(`Error: User ${location} can not be deleted from SAP IAS.`);
            console.error(`Error: ${error.message}`);
        }
    }

    async getRoleCollection(roleId) {
        try {
            let roleIdEncoded = encodeURIComponent(roleId);
            let token = this.token;
            let authOptions = {
                method: 'GET',
                url: xsuaa.apiurl + `/Groups/${roleIdEncoded}`,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            };
            let response = await axios(authOptions);
            
            console.log("Role collection successfully retrieved from subaccount.");
            return response.data;
        } catch (error) {
            console.error("Error: Role collection can not be retrieved from subaccount.")
            throw error;
        }
    }

    async updateRoleCollection(roleCollection) {
        try {
            let roleIdEncoded = encodeURIComponent(roleCollection.id);
            let token = this.token;
            let authOptions = {
                method: 'PUT',
                url: xsuaa.apiurl + `/Groups/${roleIdEncoded}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'If-Match': 5
                },
                data: roleCollection
            };
            let response = await axios(authOptions);
            
            console.log("Role collection/Group successfully updated.");
            return response.data;
        } catch (error) {
            console.error("Error: Role collection/Group can not be updated.")
            throw error;
        }
    }

    async assignRoleCollectionToUser(roleId, shadowId) {
        try {
            let roleCollection = await this.getRoleCollection(roleId);
            roleCollection.members.push({
                "origin": this.ias ? "sap.default" : "sap.custom",
                "type": "USER",
                "value": shadowId
            })
            
            await this.updateRoleCollection(roleCollection)
            console.log("Role collection successfully assigned to shadow user.");
        } catch (error) {
            console.error("Error: Role collection can not be assigned to shadow user.");
            throw error;
        }
    }

    async deleteUser(user) {
        try {
            await this.deleteShadowUser(user.shadowId);
            this.ias && await this.deleteIASUser(user.iasLocation);
        } catch (error) {
            throw error;
        }
    }

    async removeRoleCollectionFromUser(roleId, shadowId) {
        try {
            let roleCollection = await this.getRoleCollection(roleId);
            roleCollection.members = roleCollection.members.filter(function (member) {
                return member.value !== shadowId;
            })
            
            await this.updateRoleCollection(roleCollection)
            console.log("Role collection successfully removed from shadow user.");
        } catch (error) {
            console.error("Error: Role collection can not be removed from shadow user.");
            throw error;
        }
    }

    async getRoleCollections(searchValue, pagination) {
        try {
            let query = new URLSearchParams({
                sortBy: `displayName`,
                ...pagination
            }).toString()

            let token = this.token;
            let authOptions = {
                method: 'GET',
                url: xsuaa.apiurl + `/Groups?${query}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            let response = await axios(authOptions);
            console.log("Role collections successfully retrieved from subaccount.")

            if (searchValue) {
                return response.data.resources.filter((resource) => resource.id.includes(searchValue))
            } else {
                return response.data.resources;
            }

        } catch (error) {
            console.error("Error: Role collections can not be retrieved from subaccount.")
            throw error;
        }
    }

    async validateRoleCollection(roleId) {
        try {
            let token = this.token;
            let authOptions = {
                method: 'GET',
                url: xsuaa.apiurl + `/sap/rest/authorization/v2/rolecollections`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };
            let response = await axios(authOptions);
            let collections = response.data;
            let roleCollection = collections.find((collection) => collection.name === roleId);

            // Checking here if the user trying to assign the role which is not allowed
            let notAllowed = roleCollection.roleReferences.find((roleReference) => roleReference.roleTemplateAppId !== xsuaa.xsappname)
            
            if (notAllowed) {
                throw new Error(`Role collection ${roleId} is not created by this application, therefore cannot be assigned!`)
            }
        } catch (error) {
            console.error(`Error: An error occored while validating role collection with ID ${roleId}`);
            throw error
        }
    }

    #checkIASBinding() {
        try {
            return xsenv.getServices({ ias: { label: 'identity' } }) && true;
        } catch (error) {
            return false
        }
    }
}

export default UserManagement;