export class harperDBConnection {
    constructor(url, user, pass) {
        this.url = url;
        this.headers = {
            'Content-Type': 'application/json',
            authorization: 'Basic ' + Buffer.from(user + ':' + pass).toString('base64'),
        };
    }
    insert(db, table, data) {
        fetch(this.url, {
            method: 'POST',
            body: JSON.stringify({
                operation: 'insert',
                schema: db,
                table: table,
                records: [data],
            }),
            headers: this.headers,
        }).then(response => {
            if (response.ok) {
                response.json().then(json => {
                    console.log(json);
                    return true;
                });
            }
            return false;
        });
    }

    select(db, table, query) {
        fetch(this.url, {
            method: 'POST',
            body: JSON.stringify({
                operation: 'sql',
                sql: query,
            }),
            headers: this.headers,
        }).then(response => {
            if (response.ok) {
                response.json().then(json => {
                    console.log(json);
                    return true;
                });
            }
            return false;
        });
    }
    update(db, table, data) {
        fetch(this.url, {
            method: 'POST',
            body: JSON.stringify({
                operation: 'update',
                schema: db,
                table: table,
                records: [data],
            }),
            headers: this.headers,
        }).then(response => {
            if (response.ok) {
                response.json().then(json => {
                    console.log(json);
                    return true;
                });
            }
            return false;
        });
    }
}
