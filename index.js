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
  INNER JOIN department ON role.department_id = department.id`;

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
      const sql = `INSERT INTO department (name)
                  VALUES (?)`;
      connection.query(sql, (err, results) => {
        if (err) throw err;
        console.log(`Successfully added to the database.`);
        viewDepartments();
      });
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

      connection.query(`SELECT role.id, role.title FROM role`, (err, data) => {
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

            connection.query(`SELECT * FROM employee`, (err, data) => {
              if (err) throw err;

              const managers = data.map(({ id, first_name, last_name }) => ({
                name: first_name + " " + last_name,
                value: id,
              }));

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

// function to update an employee
updateEmployee = () => {
  // get employees from employee table

  connection.query(`SELECT * FROM employee`, (err, data) => {
    if (err) throw err;

    const employees = data.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "name",
          message: "Which employee would you like to update?",
          choices: employees,
        },
      ])
      .then((empChoice) => {
        const employee = empChoice.name;
        const params = [];
        params.push(employee);

        connection.query(`SELECT * FROM role`, (err, data) => {
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
                message: "What is the employee's new role?",
                choices: roles,
              },
            ])
            .then((roleChoice) => {
              const role = roleChoice.role;
              params.push(role);

              let employee = params[0];
              params[0] = role;
              params[1] = employee;

              connection.query(
                `UPDATE employee SET role_id = ? WHERE id = ?`,
                params,
                (err, result) => {
                  if (err) throw err;
                  console.log("Employee has been updated!");

                  viewEmployees();
                }
              );
            });
        });
      });
  });
};

// function to update an employee manager
updateManager = () => {
  // get employees from employee table

  connection.promise().query(`SELECT * FROM employee`, (err, data) => {
    if (err) throw err;

    const employees = data.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "name",
          message: "Which employee would you like to update?",
          choices: employees,
        },
      ])
      .then((empChoice) => {
        const employee = empChoice.name;
        const params = [];
        params.push(employee);

        connection.promise().query(`SELECT * FROM employee`, (err, data) => {
          if (err) throw err;

          const managers = data.map(({ id, first_name, last_name }) => ({
            name: first_name + " " + last_name,
            value: id,
          }));

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

              let employee = params[0];
              params[0] = manager;
              params[1] = employee;

              connection.query(
                `UPDATE employee SET manager_id = ? WHERE id = ?`,
                params,
                (err, result) => {
                  if (err) throw err;
                  console.log("Employee has been updated!");

                  viewEmployees();
                }
              );
            });
        });
      });
  });
};

// function to delete department
deleteDepartment = () => {
  const deptSql = `SELECT * FROM department`;

  connection.query(deptSql, (err, data) => {
    if (err) throw err;

    const dept = data.map(({ name, id }) => ({ name: name, value: id }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "dept",
          message: "What department do you want to delete?",
          choices: dept,
        },
      ])
      .then((deptChoice) => {
        const dept = deptChoice.dept;
        const sql = `DELETE FROM department WHERE id = ?`;

        connection.query(sql, dept, (err, result) => {
          if (err) throw err;
          console.log("Successfully deleted!");

          viewDepartments();
        });
      });
  });
};

//function to view employee via department
employeeDepartment = () => {
  const sql = `SELECT employee.first_name, 
                      employee.last_name, 
                      department.name AS department
               FROM employee 
               LEFT JOIN role ON employee.role_id = role.id 
               LEFT JOIN department ON role.department_id = department.id`;

  connection.promise().query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptUser();
  });
};

viewBudget = () => {
  connection.query(
    `SELECT department_id AS id, 
  department.name AS department,
  SUM(salary) AS budget
FROM  role  
JOIN department ON role.department_id = department.id GROUP BY  department_id`,
    (err, rows) => {
      if (err) throw err;
      console.table(rows);

      promptUser();
    }
  );
};
