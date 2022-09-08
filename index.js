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
