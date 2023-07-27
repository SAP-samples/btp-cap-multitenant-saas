
import cds from '@sap/cds';
import chai from 'chai';
import chaiSubset from 'chai-subset';
chai.use(chaiSubset);
const expect = chai.expect;

cds.test('serve',"--profile","local-with-mtx","--in-memory","--project",process.env.PWD + "/srv")

describe('Multitenancy is up and running', () => {
  it('Subscribe for tenant t1', async () => {
    var { 'cds.xt.DeploymentService': ds } = cds.services
    await ds.subscribe("t1");
  })
})


describe('Service Test', () => {
  it('Admin and Public Service service served successfully', () => {
    const { AdminService } = cds.services;
    const { PublicService } = cds.services;
  })
})

describe('Entity Consistency Test', () => {
  it('Countries entity is consistent', async () => {
    const AdminService = await cds.connect.to('AdminService')
    cds.context = { user: new cds.User.Privileged,tenant:"t1" }
    let countries = await AdminService.read("Countries")
    expect(countries).to.containSubset([{ "name": "France", "descr":"France","code":"FR" }]);
  })
  it('Currencies entity is consistent', async () => {
    const CatalogService = await cds.connect.to('PublicService')
    cds.context = { user: new cds.User.Privileged,tenant:"t1" }
    let Currencies = await CatalogService.read("Currencies")
    expect(Currencies).to.containSubset([{ "name": "Euro" }]);
  })
})

describe('Multitenancy is up and running', () => {
  it('Unsubscribe the tenant t1', async () => {
    var { 'cds.xt.DeploymentService': ds } = cds.services
    await ds.unsubscribe("t1");
  })
})
