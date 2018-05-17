if (!global.db) {
    const pgp = require('pg-promise')();
    db = pgp(process.env.DB_URL);
}

function list(searchText = '', start, unaccomplishedOnly=false) {
    const where = [];
    if(unaccomplishedOnly)
        where.push(`"doneTs" IS NULL`);
    if (searchText)
        where.push(`text ILIKE '%$1:value%'`);
    if (start)
        where.push('id < $2');
    const sql = `
        SELECT *
        FROM todos
        ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
        ORDER BY id DESC
        LIMIT 10
    `;
    return db.any(sql, [searchText, start]);
}

function create(mood, text) {
    const sql = `
        INSERT INTO todos ($<this:name>)
        VALUES ($<mood>, $<text>)
        RETURNING *
    `;
    return db.one(sql, {mood, text});
}
function accomplish(id) {
    const sql = `
        UPDATE todos
        SET "doneTs" = extract(epoch from now())
        WHERE id = $1
        RETURNING *
    `;
    return db.one(sql, [id]);
}

module.exports = {
    list,
    create,
    accomplish
};
