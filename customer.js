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
	console.log("Welcome to Kerblam! The galaxy's biggest retailer");
	menu();
});

// main menu
function menu() {
	const query =
	"SELECT product_id, product_name, stock, price, products.department_id AS department_id, department_name FROM products\
	LEFT JOIN departments ON products.department_id = departments.department_id\
	ORDER BY department_id, product_name";
	db.query(query, (err, data) => {
		if (err) throw err;

		// build choices list for inquirer from product results
		var choices = [];
		var lastDeptID = '';
		data.forEach(row => {
			if (row.department_id !== lastDeptID) {
				// we've reached a new department, add a separator
				choices.push(new inquirer.Separator(`[${row.department_name}]`));
				lastDeptID = row.department_id;
			}
			if (row.stock > 0) {
				// add product to the list
				choices.push({
					value: row,
					name: `${row.product_name} ($${row.price})`,
					short: row.product_name
				});
			} else {
				// add out of stock product as unselectable separator
				choices.push(new inquirer.Separator(`${row.product_name} [out of stock]`));
			}
		});
		choices.push(new inquirer.Separator());
		choices.push({
			value: 'exit',
			name: 'Exit'
		});
		// exit value skips following questions and ends the program

		inquirer.prompt([{
			name: 'product',
			type: 'list',
			message: 'What product would you like to buy?',
			choices: choices
		}, {
			when: answers => answers.product !== 'exit',
			name: 'quantity',
			type: 'number',
			message: 'How many would you like?',
			validate: (answer, answers) => {
				if (!Number.isInteger(answer)) return 'Please enter an integer quantity.';
				if (answer <= 0) return 'Please enter a positive quantity.';
				if (answer > answers.product.stock) return `Not enough in stock. (${answers.product.stock} available)`;
				return true;
			}
		}, {
			when: answers => answers.product !== 'exit',
			name: 'confirm',
			type: 'confirm',
			message: answers => `Purchase ${answers.quantity} ${answers.product.product_name} for $${answers.product.price * answers.quantity}?`,
			default: true
		}]).then(answers => {
			if (answers.product === 'exit') {
				exit();
				return;
			}

			if (!answers.confirm) {
				console.log('Your order was canceled.');
				console.log();
				menu();
				return;
			}

			// reduce stock by quantity, increase sales by total
			const query = "UPDATE products SET stock = stock-?, sales = sales+price*? WHERE product_id = ?";
			const vars = [answers.quantity, answers.quantity, answers.product.product_id];
			db.query(query, vars, (err) => {
				if (err) throw err;

				console.log('Your order was placed!');
				console.log();
				inquirer.prompt([{
					name: 'again',
					type: 'confirm',
					message: 'Place another order?'
				}]).then(answers => {
					if (answers.again) {
						menu();
					} else {
						exit();
					}
				});
			});
		});
	});
}


function exit() {
	console.log('Thanks for your business!');
	console.log();
	db.end();
}
