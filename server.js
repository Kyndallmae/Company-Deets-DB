// requried dependencies
const mysql = require("mysql2");
const inquirer = require("inquirer");
require("console.table");
// database connection
const db = mysql.createConnection(
  {
    host: 'localhost',

    user: 'root',

    password: 'Archie0702!',

    database: 'employees_db',

    port: 3001
  },
  console.log(`Connected to the database.`)
);

db.connect((err) => {
  if (err) throw err;
  console.log("Employee Tracker \n-------------------");
  mainMenu();
});

// main inquirer prompt
function mainMenu() {

  inquirer
    .prompt({
      type: "list",
      name: "mainMenu",
      message: "Select from the following options.",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add an employee",
        "Update an employees role",
        "Quit"
      ]
    })
    .then(({ mainMenu }) => {
      switch (mainMenu) {
        case "View all departments":
          viewDepartments();
          break;

        case "View all roles":
          viewRoles();
          break;

        case "View all employees":
          viewEmployee();
          break;

        case "Add a department":
          addDepartment();
          break;

        case "Add an employee":
          addEmployee();
          break;

        case "Update an employees role":
          updateEmployeeRole();
          break;

        case "Quit":
          db.end();
          break;
      }
    });
};

// view all departments function
function viewDepartments() {
  const sql = `
  SELECT department.id AS id, department.name AS department 
  FROM department;
  `
  db.query(sql, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.table(result);
    mainMenu();
  })
};

// view all roles function
function viewRoles() {
  const sql = `
  SELECT role.title AS role, role.id AS role_id, role.salary AS salary, department.name AS department
  FROM department
  LEFT JOIN role 
  ON (department.id = role.department_id)
  ORDER BY role.title;
  `
  db.query(sql, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.table(result);
    mainMenu();
  })
};

// view all employees function
function viewEmployee() {
  const sql = `
  SELECT employee.id, employee.first_name, employee.last_name, role.title AS role, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
  FROM employee
  LEFT JOIN employee manager on manager.id = employee.manager_id
  INNER JOIN role ON (role.id = employee.role_id)
  INNER JOIN department ON (department.id = role.department_id)
  ORDER BY employee.id;
  `
  db.query(sql, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.table(result);
    mainMenu();
  })
};

// function to add the newly created department to the department table
function insertDepartment({ departmentName }) {
  const sql = `
INSERT INTO department (name)
VALUES (?)
`
  const params = departmentName;
  db.query(sql, params, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.log("Successfully added ", departmentName);
    mainMenu();
  });
};

// function to create a new department
function addDepartment() {
  inquirer.prompt([
    {
      type: "input",
      name: "departmentName",
      message: "Whats the name of the new department?"
    }
  ])
    .then((answer) => {
      insertDepartment(answer);
    })
};

// function to add an employee, their role, and their manager
function addEmployeeRole(roles) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "employeeFirstName",
        message: "What's the employees first name?"
      },
      {
        type: "input",
        name: "employeeLastName",
        message: "What's the employees last name?"
      },
      {
        type: "list",
        name: "employeeRole",
        message: "What's the employees role",
        choices: roles
      },
      {
        type: "list",
        name: "employeeManager",
        message: "Who is this employees manager?",
        choices: [
          "Beth Davila",
          "Deacon Cline",
          "Kayleigh Combs",
          "Matthew Sanford",
          "Wanda Roberson",
          "NULL"
        ]
      },
    ])
    .then((answer) => {
      const sql = `
      INSERT INTO employee SET ?
    `
      db.query(sql, {
        first_name: answer.employeeFirstName,
        last_name: answer.employeeLastName,
        role_id: answer.employeeRole,
        manager_id: answer.manager_id,
      },
        (err, result) => {
          if (err) {
            res.status(400).json({ error: err.message });
            return;
          }
          console.table(result);
          console.log("Successfully added employee");
          mainMenu();
        })
    })
};

// function to get the roles from the role table and map them into an array
function addEmployee() {
  const sql = `
  SELECT role.id, role.title
  FROM role;
  `
  db.query(sql, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    const roles = result.map(({ id, title }) => ({
      name: title,
      value: id
    }));
    console.table(result);
    addEmployeeRole(roles);
  })
}

// function to get the employees from the employee table and map them into an array
function updateEmployeeRole() {
  const sql = `
  SELECT employee.id, CONCAT(employee.first_name, " ", employee.last_name) AS employee
  FROM employee;
  `
  db.query(sql, (err, result) => {
    if (err) {
      result.status(400).json({ error: err.message });
      return;
    }
    const employees = result.map(({ id, employee }) => ({
      name: employee,
      value: id
    }));
    console.error(err);
    console.table(result);
    employeeRoles(employees);
  });
};

// function to get the roles from the role table and map them into an array
function employeeRoles(employees) {
  const sql = `
  SELECT role.id, role.title
  FROM role;
  `
  let roles;
  db.query(sql, (err, result) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    roles = result.map(({ id, title }) => ({
      name: title,
      value: id
    }));
    console.table(result);

    updatePrompt(employees, roles);
  });
};

// function to update a selected employees role
function updatePrompt(employees, roles) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "employeeOptions",
        message: "Select an employee to update",
        choices: employees
      },
      {
        type: "list",
        name: "roleOptions",
        message: "What role would you like to assign to the employee?",
        choices: roles
      },
    ])
    .then((answer) => {
      const sql = `
      UPDATE employee SET role_id = ? WHERE id = ?;
      `
      db.query(sql,
        [
          answer.roleOptions,
          answer.employeeOptions
        ],
        (err, result) => {
          if (err) {
            res.status(400).json({ error: err.message });
            return;
          }
          console.table(result);
          console.log("Employees role successfully updated");
          mainMenu();
        }
      )
    })
}
