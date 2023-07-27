# Backup SAP HANA Cloud Database Containers

This part of the **Expert Scope** explains how to export and import SAP HANA Cloud HDI (HANA Deployment Infrastructure) containers in a SaaS scenario. This can be useful to back up your subscriber data on a regular basis. Please be aware that the import process will overwrite the content of your target container. For this reason also make sure, not to apply incompatible database changes between the backup and import of a container. 

Before approaching this part of the **Expert Scope**, please make sure to set up a new HDI Container Group Administrator first as described in the following part of the Expert Scope ([Manage Tenant Database Containers](../manage-tenant-containers/README.md)) and use the respective user for the steps below.

1. [Introduction](#1-Introduction)
2. [Prerequisites](#2-Prerequisites)
3. [Export an existing container](#3-Export-an-existing-container)
4. [Import into an existing container](#4-Import-into-an-existing-container)
5. [Dependencies and privileges](#5-Dependencies-and-privileges)
6. [Further Information](#6-Further-Information)

In this sample use-case we assume the following backup scenario. If your scenario is different from the following assumptions, please test your requirements in a sandbox system first, before deleting any tenant database containers! In general, we recommend testing all backup-related steps before applying them in a productive environment!

1. You did a database container backup of tenant ABC
2. You unsubscribed tenant ABC or removed the consumer subaccount
3. You create a new subaccount and subscribe tenant ABC again
4. You want to load the backup into the new and empty database container of tenant ABC

So the important assumption is, that the target container for the import of the backup **already exists** and is part of the ordinary tenant database container lifecycle managed by the Service Manager. 

> **Hint** - In case you don't want to overwrite the target container (e.g. due to incompatible database changes), you can also import the exported container into a new database schema instead of overwriting the target schema. After the import, you can manually insert the required backups into the target container. 


## 1. Introduction

Creating and storing backups of database containers is a very critical process from a data security perspective. As a SaaS provider, you need to ensure this process is well aligned with your SaaS customers and that only a very limited group of people has permissions to access, export, and import customer database containers. 

As an alternative to a manual export, please also consider an automated technical approach (using respective SQL commands) that includes strong encryption of exported containers in a secure location. Containers can also be exported to Cloud Sources like Azure Storage or AWS S3. Please find the required steps in the respective SAP Help documents (see [Further Information](./README.md#6-further-information)).


## 2. Prerequisites

Before approaching this part of the **Expert Scope**, please make sure to set up a new HDI Container Group Administrator first as described in the following part of the Expert Scope ([Manage Tenant Database Containers](../manage-tenant-containers/README.md)). 

- The tables in the schema of the exported container must not be larger than 2GB.
- The exporting user needs to be an Admin of your container's HDI Container Group. 
- Dependent objects need to be imported first (e.g., a shared database container).
- The Object Owner (#OO) of the targeted import container needs all required permissions (e.g., for a shared database container).

Especially for the last prerequisite, please check the [Dependencies and privileges](#5-Dependencies-and-privileges) chapter! 


## 3. Export an existing container

3.1. Find the ID of the consumer tenant of which you want to export using the Subscription Management Dashboard.

[<img src="./images/export_010.png" width="500" />](./images/export_010.png?raw=true)

[<img src="./images/export_020.png" width="500" />](./images/export_020.png?raw=true)

3.2. Find the related tenant database container within your Service Manager instance by checking the labels. 

[<img src="./images/export_030.png" width="500" />](./images/export_030.png?raw=true)

3.3. Open the existing service key, to identify the schema name of the container you want to export. 

[<img src="./images/export_040.png" width="500" />](./images/export_040.png?raw=true)

3.4. Go to SAP HANA Database Explorer and log in with an HDI Container (Group) Admin of the database container you want to export (see Prerequisites section). 

[<img src="./images/export_050.png" width="500" />](./images/export_050.png?raw=true)

3.5. Right-click the root of this user's database connection and select **Export HDI Container**. 

[<img src="./images/export_060.png" width="500" />](./images/export_060.png?raw=true)

3.6. Search for the schema name which you identified in the service key of the corresponding Service Manager container instance. 

[<img src="./images/export_070.png" width="500" />](./images/export_070.png?raw=true)

3.7. Select the schema from the result list and click on **Prepare HDI Container for Download** to start the process. 

[<img src="./images/export_090.png" width="500" />](./images/export_090.png?raw=true)

3.8. Select **Prepare** in the next popup.

[<img src="./images/export_100.png" width="500" />](./images/export_100.png?raw=true)

3.9. Click the refresh button in the Background Activities pane, until your export job is in status **SUCCESS**.

[<img src="./images/export_110.png" width="500" />](./images/export_110.png?raw=true)

3.10. **Double-click** on your export job, to open the download popup and download your exported container content. 

[<img src="./images/export_120.png" width="500" />](./images/export_120.png?raw=true)

3.11. After downloading, you can delete the temporary database table again which was created for the export. 

3.12. Therefore, select your export job by clicking on the checkbox and hitting the **trash icon**. 

[<img src="./images/export_130.png" width="500" />](./images/export_130.png?raw=true)

3.13. You can now delete the background activity and/or the temporary table by selecting the option of your choice. 

[<img src="./images/export_140.png" width="500" />](./images/export_140.png?raw=true)


## 4. Import into an existing container

4.1. Go to SAP HANA Database Explorer and log in with an HDI Container (Group) Admin of the container you want to restore your backup in. 

> **Important** - The database container in which you want to restore your backup, already has to exist before doing the following steps! Also, check the next chapter to learn about pre-import prerequisites in case of cross-container-access scenarios!

[<img src="./images/import_005.png" width="500" />](./images/import_005.png?raw=true)

4.2. Right-click the root of this user's database connection and select **Import HDI Container**. 

[<img src="./images/import_010.png" width="500" />](./images/import_010.png?raw=true)

4.3. Click on **Browse** to select the archived database container content from your hard disk.

[<img src="./images/import_020.png" width="500" />](./images/import_020.png?raw=true)

4.4. Select the archive file which you previously exported. 

[<img src="./images/import_030.png" width="500" />](./images/import_030.png?raw=true)

4.5. Click on **Upload File**.

[<img src="./images/import_040.png" width="500" />](./images/import_040.png?raw=true)

4.6. Confirm the upload in the popup window. 

[<img src="./images/import_050.png" width="500" />](./images/import_050.png?raw=true)

4.7. Wait until the upload has finished.

> **Hint** - As of today, you can only import to a new database container using the user interface, but it's not possible to import data into an existing database container. Therefore, an SQL command needs to be executed instead of clicking on **Import HDI Container**. 

[<img src="./images/import_060.png" width="500" />](./images/import_060.png?raw=true)

4.8. Refresh the schema content of your HDI Container Group Admin. 

[<img src="./images/import_070.png" width="500" />](./images/import_070.png?raw=true)

4.9. Check the tables for the database container backup stored in a temporary table.  

[<img src="./images/import_080.png" width="500" />](./images/import_080.png?raw=true)

4.10. Open a new SQL console using the HDI Container Admin of the targeted import container.

[<img src="./images/import_090.png" width="500" />](./images/import_090.png?raw=true)

4.11. Copy and paste the following SQL command and change the parameters as described. Then click on **Run** or hit **F8**. 

> Just pull the table into your SQL command window to make your life a bit easier. 

[<img src="./images/import_100.png" width="500" />](./images/import_100.png?raw=true)

**SQL Code**

~~~~sql
CALL _SYS_DI#BROKER_CG.IMPORT_CONTAINER_FOR_COPY( -- BROKER_CG = Broker Container Group
    'ABC123DGH456HIJ789KLM123NOP456QRS789',  -- Target schema to import container data
    CURRENT_SCHEMA, -- Schema containing uploaded container
    '.SAP.HRTT.ImportHDI.99991231.125959.abc-...-xyz', -- Table name containing uploaded container
    _SYS_DI.T_NO_PARAMETERS, -- Can remain default
    ?, ?, ? -- Can remain default
); 
~~~~

**Sample**

~~~~sql
CALL _SYS_DI#BROKER_CG.IMPORT_CONTAINER_FOR_COPY(
    'A12F6AC586D24B4B805A3E2587DAF10D', 
    CURRENT_SCHEMA, 
    '.SAP.HRTT.ImportHDI.20220811.144424.38b0386c-f99c-48e3-a994-5041120c7bf6', 
    _SYS_DI.T_NO_PARAMETERS, 
    ?, ?, ?
); 
~~~~

4.12. Check the logs to see if the import was successful. 

[<img src="./images/import_110.png" width="500" />](./images/import_110.png?raw=true)

4.13. You can now delete the temporary container backup table from your HDI Container Group Admin schema. Do a right-click on your table and choose **Delete**. 

[<img src="./images/import_120.png" width="500" />](./images/import_120.png?raw=true)


## 5. Dependencies and privileges

All external objects referenced in the imported container (e.g., if the imported container is accessing a shared database container) must already be available in the database and accessable to the object owner (#OO-user) of the targeted import container when starting the import process. So, if necessary, grant the object owner of the target container required privileges for accessing these objects of a shared container.

If a shared container exposes a role for cross-container access, this role must be granted (before the import) to the object owner (#OO-user) of the import target container. The role can be granted to the #OO-user either by a role administrator (ROLE ADMIN) or by using the HDI Container API for role assignment. 

Sample SQL command to assign a role using the SAP HDI Container API: 

```sql
CREATE LOCAL TEMPORARY COLUMN TABLE #ROLES LIKE _SYS_DI.TT_SCHEMA_ROLES;
INSERT INTO #ROLES ( ROLE_NAME, PRINCIPAL_SCHEMA_NAME, PRINCIPAL_NAME ) VALUES ( 'COM_EXTERNAL_ACCESS#', '', 'IMPORT_TARGET_CONTAINER#OO' );
CALL SHARED_CONTAINER#DI.GRANT_CONTAINER_SCHEMA_ROLES(#ROLES, _SYS_DI.T_NO_PARAMETERS, ?, ?, ?);
DROP TABLE #ROLES;
``` 

For more details, check the links provided in the [Further Information](./README.md#6-further-information) section.


## 6. Further Information

Please use the following links to find further information on the topics above:

* [SAP Help - Export an SAP HDI Container for Copy Purposes](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c2cc2e43458d4abda6788049c58143dc/36a5547af0304ee29e964abf27468f52.html?locale=en-US)
* [SAP Help - Export an SAP HDI Container for Copy Purposes to a Cloud Store](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c2cc2e43458d4abda6788049c58143dc/8f8501c09a4342069ee377bfc53d48e4.html?locale=en-US)
* [SAP Help - Import an SAP HDI Container for Copy Purposes](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c2cc2e43458d4abda6788049c58143dc/905a7b383a5a472f9d712fa3fb8d14ee.html?locale=en-US)
* [SAP Help - Import an SAP HDI Container for Copy Purposes from a Cloud Store](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c2cc2e43458d4abda6788049c58143dc/0f76f6ee4d7c4051b6cf797c1852ea3f.html?locale=en-US)
* [SAP Help - Grant a User a Role from the SAP HDI Container's Schema](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c2cc2e43458d4abda6788049c58143dc/6574d8eb496c4f2f9f023237abb6c87a.html?locale=en-US)
* [SAP Help - Revoke a Role from the SAP HDI Container's Schema](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c2cc2e43458d4abda6788049c58143dc/bb47fc06c27841449017d055302a4074.html?locale=en-US)