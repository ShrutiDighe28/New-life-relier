USE startersql;
GO

SELECT * FROM users WHERE name LIKE 'a%';-- Ends with A
SELECT * FROM users WHERE name LIKE '%a';-- Ends with a

SELECT * FROM users WHERE gender = 'Male' AND date_of_birth > '1990-01-01';
SELECT * FROM users WHERE gender = 'Female' OR date_of_birth > '1990-01-01';
