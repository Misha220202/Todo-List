import { Client, KustoConnectionStringBuilder, KustoResponseDataSet } from 'azure-kusto-data';

const aadAppId = 'a696b3cb-76a0-4c6a-ae25-94ddc914a236';
const appKey = 'Input your appKey here';
const database = 'TodoList';
const clusterUrl = 'https://fangshengtodolist.canadacentral.kusto.windows.net/';
const teantId = '060078fb-98e5-462b-a705-2d77a2392b21';

export class KustoHelper {
    constructor(database, connectionString, aadAppId, appKey, tenantId) {
        this.database = database;
        const kcsb = KustoConnectionStringBuilder.withAadApplicationKeyAuthentication(connectionString, aadAppId, appKey, tenantId)
        this.client = new Client(kcsb);
        console.log('KustoHelper created!');
    }

    async executeQuery(query) {
        console.log('Executing query...')
        const results = await this.client.execute(this.database, query);
        console.log(`Query executed: ${query} \n\n`);
        const firstTable = results.primaryResults[0];
        return firstTable;
    }

    async checkUserExist(userName) {
        const query = `users | where userName == '${userName}'`;
        const resultTable = await this.executeQuery(query);
        exist = resultTable._rows.length > 0;
        return exist;
    }

    fetchUser(userName) {
        let user = undefined;
        const query = `users | where userName == '${userName}'`;
        resultTable = this.executeQuery(query);
        const columnMapping = Object.fromEntries(resultTable.columns.map((column, index) => [column.name, index]));
        resultTable._rows.map(row => {
            user = {
                userName: row[columnMapping['userName']],
                profileUrl: row[columnMapping['profileUrl']]
            };
        });
        return user;
    }

    addUser(userName, profileUrl) {
        // If user already exists, we return
        if (this.checkUserExist(userName)) {
            console.log(`User already exists: ${userName}!!!`)
            return;}

        const query = `.set-or-append users with (extend_schema=true) <| 
        datatable (userName:string, profileUrl:string) ['${userName}', '${profileUrl}']`;
        this.executeQuery(query);
    }

    // Fetch all tasks of a user from the database
    fetchTask(user) {
        let tasks = [];
        const query = `userTasks | where userName == '${user}'
        | summarize arg_max(ingestion_time(), *) by id`;

        resultTable = this.executeQuery(query);
        console.log(`Tasks fetched for user: ${user}`);
        const columnMapping = Object.fromEntries(resultTable.columns.map((column, index) => [column.name, index]));
        resultTable._rows.map(row => {
            let task = {
                title: row[columnMapping['title']],
                description: row[columnMapping['description']],
                dueDate: row[columnMapping['dueDate']],
                checkStatus: row[columnMapping['checkStatus']],
                importance: row[columnMapping['importance']],
                id: row[columnMapping['id']]
            };
            tasks.push(task);
        });
        return tasks;
    }


    // Add a task of a user to the database
    addTask(userName, title, description, dueDate, checkStatus, importance, id) {
        const query = `.set-or-append userTasks with (extend_schema=true) <| 
        datatable (userName:string, title:string, description:string, dueDate:datetime, checkStatus:string, importance:string, id:string) 
        ['${userName}', '${title}', '${description}', '${dueDate}', '${checkStatus}', '${importance}', '${id}']`;
        this.executeQuery(query);
    }
}


let kustoHelper = new KustoHelper(database, clusterUrl, aadAppId, appKey, teantId);
// kustoHelper.executeQuery('print 1123').then((resultTable) => {console.log(resultTable._rows[0]);}).catch((error) => console.log(error));
console.log(kustoHelper.checkUserExist('fangsheng'));