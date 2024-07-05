import { Client, KustoConnectionStringBuilder } from 'azure-kusto-data';

// Below is service principal info to accessing Kusto in nodeJs environment, not used in browser.
// const aadAppId = 'a696b3cb-76a0-4c6a-ae25-94ddc914a236';
// const appKey = 'You appKey';
// const tenantId = '060078fb-98e5-462b-a705-2d77a2392b21';
const database = 'TodoList';
const clusterUrl = 'https://fangshengtodolist.canadacentral.kusto.windows.net/';

export class KustoHelper {
    constructor(accessToken) {
        this.database = database;
        // const kcsb = KustoConnectionStringBuilder.withUserPrompt(clusterUrl, {clientId: aadAppId, redirectUri: 'http://localhost:6420'});
        
        const kcsb = KustoConnectionStringBuilder.withAccessToken(clusterUrl, accessToken);
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
        const exist = resultTable._rows.length > 0;
        return exist;
    }

    async fetchUser(userName) {
        let user = undefined;
        const query = `users | where userName == '${userName}'`;
        const resultTable = await this.executeQuery(query);
        const columnMapping = Object.fromEntries(resultTable.columns.map((column, index) => [column.name, index]));
        resultTable._rows.map(row => {
            user = {
                userName: row[columnMapping['userName']],
                profileUrl: row[columnMapping['profileUrl']]
            };
        });
        return user;
    }

    async addUser(userName, profileUrl) {
        // If user already exists, we return
        try {
        const userExist = await this.checkUserExist(userName);
        if (userExist) {
            console.log(`User already exists: ${userName}!!!`)
            return;}
        } catch (error) {
            console.log(`Checking user existence failed: ${error}!`)
        }

        const query = `.set-or-append users with (extend_schema=true) <| 
        datatable (userName:string, profileUrl:string) ['${userName}', '${profileUrl}']`;
        await this.executeQuery(query);
    }

    // Fetch all tasks of a user from the database
    async fetchTask(user) {
        let tasks = [];
        const query = `userTasks | where userName == '${user}'
        | summarize arg_max(ingestion_time(), *) by id`;

        const resultTable = await this.executeQuery(query);
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
    async addTask(userName, title, description, dueDate, checkStatus, importance) {
        const query = `.set-or-append userTasks with (extend_schema=true) <| 
        datatable (userName:string, title:string, description:string, dueDate:datetime, checkStatus:string, importance:string) 
        ['${userName}', '${title}', '${description}', '${dueDate}', '${checkStatus}', '${importance}']`;
        try {
            await this.executeQuery(query);
        } catch (error) {
            console.log(`Adding task failed: ${error}`);
        }
    }
}

// Sample snippet to test the KustoHelper class
// let kustoHelper = new KustoHelper();
// kustoHelper.executeQuery('print 1123').then((resultTable) => {console.log(resultTable._rows[0]);}).catch((error) => console.log(error));
// kustoHelper.addUser('user1', 'user1_url').then(() => console.log('User added!')).catch((error) => console.log(error));
// kustoHelper.checkUserExist('fangsheng').then((exist) => console.log(exist)).catch((error) => console.log(error));
// kustoHelper.addTask('user2', 'See dentist', 'dental appointment to remove wisdom tooth', '2024-07-24', 'unchecked', 'important').then(() => console.log('Task added!')).catch((error) => console.log(error));