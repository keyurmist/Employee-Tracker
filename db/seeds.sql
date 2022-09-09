INSERT INTO department (name)
VALUES 
('IT'),
('Finance & Accounting'),
('Sales'),
('HR');

INSERT INTO role (title, salary, department_id)
VALUES 
('IT Manager', 350000, 1),
('Software Engineer', 100000, 1),
('HR Manager', 70000, 4),
('Accountant', 40000, 2),
('Sales Manager', 50000, 3),
('Analyst', 75000, 2),
('Senior Developer', 90000, 1),
('Full-Stack Developer', 50000, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('Genghis', 'Khan', 1, 1),
('Steve', 'Steven', 2, null),
('Hugh', 'Janus', 4, 4),
('Kevin', 'Kevinson', 3, 2),
('John', 'Johnny', 5, null),
('Jenny', 'Cream', 6, 5),
('Keith', 'Tall', 7, null),
('Angel', 'Devil', 8, 7);