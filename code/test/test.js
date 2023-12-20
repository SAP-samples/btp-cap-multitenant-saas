
import cds from '@sap/cds';
import chai from 'chai';
import chaiSubset from 'chai-subset';
chai.use(chaiSubset);
const expect = chai.expect;

cds.test('serve', 'PublicService,AdminService,cds.xt.MTXServices', '--in-memory', '--profile', 'local-with-mtx').in('./srv')

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
  it('Projects entity is consistent', async () => {
    const AdminService = await cds.connect.to('AdminService')
    cds.context = { user: new cds.User.Privileged,tenant:"t1" }
    let projects = await AdminService.read("Projects")
    expect(projects).to.containSubset([{ "ID": "d419b9d9-897e-4e1f-9a7d-6a16e3c8f776", "description":"Project 1" }]);
  })
  it('Assessments entity is consistent', async () => {
    const CatalogService = await cds.connect.to('PublicService')
    cds.context = { user: new cds.User.Privileged,tenant:"t1" }
    let assessements = await CatalogService.read("Assessments")
    expect(assessements).to.containSubset([{ "ID": "7152266c-d4bd-42d2-85d9-9a770d649c8b", "description":"Project 1 - Assessment 1 - HT-1001" }]);
  })
})

describe('Multitenancy is up and running', () => {
  it('Unsubscribe the tenant t1', async () => {
    var { 'cds.xt.DeploymentService': ds } = cds.services
    await ds.unsubscribe("t1");
  })
})

// TODO --> Add extensibility 
