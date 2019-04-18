var inquirer = require('inquirer');
var mysql    = require('mysql');

var db = mysql.createConnection({
	host: 'localhost',
	port: 8889,
	user: 'root',
	password: 'root',
	database: 'store'
});
db.connect(err => {
	if (err) throw err;
	// console.log('[DB] Connected as ID ' + db.threadId);
	console.log();
	console.log("Welcome, manager.");
	menu();
});

function menu() {
	inquirer.prompt([{
		name: 'action',
		type: 'list',
		message: 'Choose an action:',
		choices: [
		'View Products for Sale',
		'View Low Inventory',
		'Add to Inventory',
		'Add New Product',
		new inquirer.Separator(),
		'Exit'
		]
	}]).then(answers => {

		switch (answers.action) {
			case 'View Products for Sale':
			listAll();
			break;

			case 'View Low Inventory':
			listLow(5);
			break;

			case 'Restock':
			restock();
			break;

			case 'Add New Product':
			addProduct();
			break;

			case 'Exit':
			db.end();
			break;
		}

	});
}


function listAll() {
	const query =
	"SELECT product_id, product_name, stock, price, products.department_id AS department_id, department_name FROM products\
	LEFT JOIN departments ON products.department_id = departments.department_id\
	ORDER BY department_id, product_name";
	db.query(query, (err, data) => {
		if (err) throw err;

		var lastDeptID = '';
		data.forEach(row => {
			if (row.department_id !== lastDeptID) {
				console.log(`[#${row.department_id} ${row.department_name}]`);
				lastDeptID = row.department_id;
			}
			console.log(`#${row.product_id} ${row.product_name} (${row.price}) x${row.stock}`);
		});

		console.log();
		menu();
	});
}

function listLow(limit) {
	const query =
	"SELECT product_id, product_name, stock, products.department_id AS department_id, department_name FROM products\
	LEFT JOIN departments ON products.department_id = departments.department_id\
	WHERE stock < ?\
	ORDER BY stock ASC, department_id, product_name";
	db.query(query, [limit], (err, data) => {
		if (err) throw err;

		data.forEach(row => {
			console.log(`[${row.department_name}] #${row.product_id} ${row.product_name} x${row.stock}`);
		});

		console.log();
		menu();
	});
}










