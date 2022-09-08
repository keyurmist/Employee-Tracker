const inquirer = require("inquirer");
const mysql = require("mysql2");
const consoleTable = require("console.table");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Roflsticks081994_",
  database: "employee_db",
});

connection.connect(function (err) {
  if (err) throw err;
  connected();
});

connected = () => {
  console.log("WELCOME TO THE EMPLOYEE MANAGER");
  promptUser();
};

//After connection user is prompted with the first question
const promptUser = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "choices",
        message: "What would you like to do?",
        choices: [
          "View all departments",
          "View all roles",
          "View all employees",
          "Add a department",
          "Add a role",
          "Add an employee",
          "Update an employee role",
          "Update an employee manager",
          "View employees by department",
          "Delete a department",
          "Delete a role",
          "Delete an employee",
          "View department budgets",
          "Quit",
        ],
      },
    ])
    .then((answers) => {
      const { choices } = answers;

      if (choices === "View all departments") {
        viewDepartments();
      }

      if (choices === "View all roles") {
        viewRoles();
      }

      if (choices === "View all employees") {
        viewEmployees();
      }

      if (choices === "Add a department") {
        addDepartment();
      }

      if (choices === "Add a role") {
        addRole();
      }

      if (choices === "Add an employee") {
        addEmployee();
      }

      if (choices === "Update an employee role") {
        updateEmployee();
      }

      if (choices === "Update an employee manager") {
        updateManager();
      }

      if (choices === "View employees by department") {
        employeeDepartment();
      }

      if (choices === "Delete a department") {
        deleteDepartment();
      }

      if (choices === "Delete a role") {
        deleteRole();
      }

      if (choices === "Delete an employee") {
        deleteEmployee();
      }

      if (choices === "View department budgets") {
        viewBudget();
      }

      if (choices === "Quit") {
        connection.end();
      }
    });
};

//function to view departments
viewDepartments = () => {
  const sql = `SELECT department.id AS id, department.name AS department FROM department`;

  connection.query(sql, (err, answer) => {
    if (err) throw err;
    console.table(answer);
    promptUser();
  });
};
