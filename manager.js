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
		'Restock',
		'Add New Product',
		'Add New Department',
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

			case 'Add New Department':
			addDepartment();
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

function restock() {
	const query =
	"SELECT product_id, product_name, stock, products.department_id AS department_id, department_name FROM products\
	LEFT JOIN departments ON products.department_id = departments.department_id\
	ORDER BY department_id, stock ASC, product_name";
	db.query(query, (err, data) => {
		if (err) throw err;

		var choices = [];
		var lastDeptID = '';
		data.forEach(row => {
			if (row.department_id !== lastDeptID) {
				choices.push(new inquirer.Separator(`[${row.department_name}]`));
				lastDeptID = row.department_id;
			}
			if (row.stock > 0) {
				choices.push({
					value: row,
					name: `${row.product_name} x${row.stock}`,
					short: row.product_name
				});
			} else {
				choices.push({
					value: row,
					name: `${row.product_name} [out of stock]`,
					short: row.product_name
				});
			}
		});
		choices.push(new inquirer.Separator());
		choices.push({
			value: 'menu',
			name: 'Cancel'
		});

		inquirer.prompt([{
			name: 'product',
			type: 'list',
			message: 'What product would you like to stock?',
			choices: choices
		}, {
			when: answers => answers.product !== 'menu',
			name: 'quantity',
			type: 'number',
			message: 'How many would you like to stock?',
			validate: (answer, answers) => {
				if (!Number.isInteger(answer)) return 'Please enter an integer quantity.';
				if (answer <= 0) return 'Please enter a positive quantity.';
				return true;
			}
		}]).then(answers => {
			if (answers.product === 'menu') {
				menu();
				return;
			}

			const query = "UPDATE products SET stock = stock+? WHERE product_id = ?";
			const vars = [answers.quantity, answers.product.product_id];
			db.query(query, vars, (err) => {
				if (err) throw err;

				console.log(`${answers.product.product_name} restocked to ${answers.product.stock + answers.quantity}!`);
				console.log();
				inquirer.prompt([{
					name: 'again',
					type: 'confirm',
					message: 'Restock another product?'
				}]).then(answers => {
					if (answers.again) {
						restock();
					} else {
						menu();
					}
				});
			});
		});
	});
}


function addProduct() {
	const query = "SELECT department_id, department_name FROM departments";
	db.query(query, (err, data) => {

		inquirer.prompt([{
			name: 'product_name',
			message: 'Enter the product name:'
		}, {
			name: 'price',
			type: 'number',
			message: 'Enter the price:',
			transformer: answer => '$'+answer,
			validate: answer => {
				if (!Number.isInteger(answer*100)) return 'Sub-penny denominations are not supported.';
				return true;
			}
		}, {
			name: 'department_id',
			type: 'list',
			message: 'Choose a department:',
			choices: data.map(row => {
				return {
					value: row.department_id,
					name: row.department_name
				}
			})
		}]).then(answers => {
			db.query("INSERT INTO products SET ?", answers, (err) => {
				if (err) throw err;

				console.log('Product added!');
				console.log();
				menu();

			});

		});

	});
	
}


function addDepartment() {
	inquirer.prompt([{
		name: 'department_name',
		message: 'Enter the department name:'
	}]).then(answers => {
		db.query("INSERT INTO departments SET ?", answers, (err) => {
			if (err) throw err;

			console.log('Department added!');
			console.log();
			menu();

		});

	});
}
