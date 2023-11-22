INSERT INTO department (name)
VALUES  ("Billing"),
        ("Sales"),
        ("Reception"),
        ("Managment"),
        ("Human Resources");

INSERT INTO departments (id, dep_name)
VALUES ('12345', 'Billing'),
       ('67890', 'Sales'),
       ('101112', 'Reception'),
       ('131415', 'Managment'),
       ('161718', 'Human Resources');

INSERT INTO roles (id, title, salary, department_id)
VALUES ('001', 'Accountant', '$90,000', '12345'),
       ('002', 'Sales Person', '$90,000', '67890'),
       ('003', 'Receptionist', '$40,000', '101112'),
       ('004', 'Manager', '$100,000', '131415'),
       ('005', 'HR Representative', '$80,000', '161718');

INSERT INTO employees (id, first_name, last_name, role_id, manager_id)
VALUES ('101', 'Angela', 'Martin', '001', '004'),
       ('202', 'Dwight', 'Shrute', '002', '004'),
       ('303', 'Pam', 'Beasley', '003', '004'),
       ('404', 'Michael', 'Scott', '004', '004'),
       ('505', 'Toby', 'Flenderson', '005', '004');