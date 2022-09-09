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

//function to view roles
viewRoles = () => {
  const sql = `
  SELECT role.id, role.title, department.name AS department FROM role
  INNER JOIN deparment ON role.department_id = department.id`;

  connection.query(sql, (err, answer) => {
    if (err) throw err;
    console.table(answer);
    promptUser();
  });
};

//function to view employees
viewEmployees = () => {
  const sql = `SELECT employee.id, 
    employee.first_name, 
    employee.last_name, 
    role.title, 
    department.name AS department,
    role.salary, 
    CONCAT (manager.first_name, " ", manager.last_name) AS manager
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id`;

  connection.query(sql, (err, answer) => {
    if (err) throw err;
    console.table(answer);
    promptUser();
  });
};

//function to add department
addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "department",
        message: "What is the name of the department you wish to add?",
        validate: async (answer) => {
          if (!answer) {
            return "Please enter a valid department";
          }
          return true;
        },
      },
    ])
    .then(function (answer) {
      connection.query(
        `INSERT INTO department department (name) 
         VALUES ("${answer.department}")`,
        (err, results) => {
          if (err) throw err;
          console.log(
            `Successfully added ${answer.department} to the database.`
          );
          viewDepartments();
        }
      );
    });
};

//Function to add a role
addRole = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "role",
        message: "What role do you want to add?",
        validate: async (answer) => {
          if (!answer) {
            return "Please enter a valid role";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "salary",
        message: "What is the salary of this role?",
        validate: (answer) => {
          if (!answer || isNaN(answer)) {
            return "Please enter a valid number";
          }
          return true;
        },
      },
    ])
    .then((answer) => {
      const params = [answer.role, answer.salary];
      const roleSql = `SELECT name, id FROM department`;

      connection.query(roleSql, (err, data) => {
        if (err) throw err;

        const departments = data.map(({ name, id }) => ({
          name: name,
          value: id,
        }));
        inquirer
          .prompt([
            {
              type: "list",
              name: "departments",
              message: "Which department does thie role belong to?",
              choices: departments,
            },
          ])
          .then((departmentChoice) => {
            const departments = departmentChoice.departments;
            params.push(departments);

            const sql = `INSERT INTO role (title, salary, department_id)
            VALUES (?, ?, ?)`;

            connection.query(sql, params, (err, result) => {
              if (err) throw err;
              console.log(`Successfully added ${answer.role} to the database`);
              viewRoles();
            });
          });
      });
    });
};

// function to add an employee
addEmployee = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "fistName",
        message: "What is the employee's first name?",
        validate: async (answer) => {
          if (!answer) {
            return "Please enter a valid name";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "lastName",
        message: "What is the employee's last name?",
        validate: async (answer) => {
          if (!answer) {
            return "Please enter a valid name";
          }
          return true;
        },
      },
    ])
    .then((answer) => {
      const params = [answer.fistName, answer.lastName];

      // grab roles from roles table

      connection
        .promise()
        .query(`SELECT role.id, role.title FROM role`, (err, data) => {
          if (err) throw err;

          const roles = data.map(({ id, title }) => ({
            name: title,
            value: id,
          }));

          inquirer
            .prompt([
              {
                type: "list",
                name: "role",
                message: "What is the employee's role?",
                choices: roles,
              },
            ])
            .then((roleChoice) => {
              const role = roleChoice.role;
              params.push(role);

              connection
                .promise()
                .query(`SELECT * FROM employee`, (err, data) => {
                  if (err) throw err;

                  const managers = data.map(
                    ({ id, first_name, last_name }) => ({
                      name: first_name + " " + last_name,
                      value: id,
                    })
                  );

                  inquirer
                    .prompt([
                      {
                        type: "list",
                        name: "manager",
                        message: "Who is the employee's manager?",
                        choices: managers,
                      },
                    ])
                    .then((managerChoice) => {
                      const manager = managerChoice.manager;
                      params.push(manager);

                      const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                    VALUES (?, ?, ?, ?)`;

                      connection.query(sql, params, (err, result) => {
                        if (err) throw err;
                        console.log("Employee has been added!");

                        viewEmployees();
                      });
                    });
                });
            });
        });
    });
};
