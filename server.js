const express = require('express');
const mysql = require('mysql2');
const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'Kyndall',
    password: 'Archie0702!',
    database: 'companydeets_db'
  },
  console.log(`Connected to the companydeets_db database.`)
);

db.connect((err) => {
  if (err) throw err;
  console.log("Employee Tracker Error: Not connected");
  companyMenu();
});

function companyMenu() {
  inquirer
    .prompt({
      type: "list",
      name: "companyMenu",
      message: "What would you like to do?",
      choices: [
        "View departments",
        "View roles",
        "View employees",
        "Add a department",
        "Add an employee",
        "Update an employees role",
        "Quit"
      ]
    })
    .then(({ companyMenu }) => {
      switch (companyMenu) {
        case "View departments":
          viewDepartments();

        case "View roles":
          viewRoles();

        case "View employees":
          viewEmployee();

        case "Add a department":
          addDepartment();

        case "Add an employee":
          addEmployee();

        case "Update an employees role":
          updateEmployeeRole();

        case "Quit":
          db.end();
      }
    });
};

// To view the departments
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
    companyMenu();
  })
};

// To view the roles 
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
    companyMenu();
  })
};

// To view the employees 
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
    companyMenu();
  })
};

// Adds new department to department table
function addDepartment({ departmentName }) {
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
    console.log("Success! ", departmentName);
    companyMenu();
  });
};

// Creates a new department
function newDepartment() {
  inquirer.prompt([
    {
      type: "input",
      name: "departmentName",
      message: "Whats the name of the new department?"
    }
  ])
    .then((answer) => {
      newDepartment(answer);
    })
};

// Adds a new employee, their role, and their manager
function addEmployeeRole(roles) {
  inquirer
    .prompt([
      {
        type: "input",
        name: "firstName",
        message: "What's the employees first name?"
      },
      {
        type: "input",
        name: "lastName",
        message: "What's the employees last name?"
      },
      {
        type: "list",
        name: "employeeRole",
        message: "What's the employees role?",
        choices: roles
      },
      {
        type: "list",
        name: "employeeManager",
        message: "Who is this employees manager?",
        choices: [
          "Michael Scott",
          "Jim Halpert",
          "Toby Flenderson",
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
          console.log("Success!");
          companyMenu();
        })
    })
};

// Takes roles from table and puts them into an array 
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

// Takes employees from table and puts them into an array
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

// Takes the roles from the roles table and puts them into an array 
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

// Updates employee
function updatePrompt(employees, roles) {
  inquirer
    .prompt([
      {
        type: "list",
        name: "currentEmployees",
        message: "Who would you like to update",
        choices: employees
      },
      {
        type: "list",
        name: "roleOptions",
        message: "What role do they play?",
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
          companyMenu();
        }
      )
    })
};

app.get('api/departments')
db.query('SELECT * FROM departments', function (err, results) {
  console.log(results);
});

app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});