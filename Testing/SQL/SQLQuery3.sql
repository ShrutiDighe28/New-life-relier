SELECT 
    p.Drname AS [Doctor Name],
    SUM(r.BillAmt) AS [Total Billed],
    SUM(r.AmtPaid) AS [Total Collected],
    SUM(r.BalAmt) AS [Total Pending]
FROM dbo.patmst p
INNER JOIN dbo.RecM r 
    ON p.PID = r.PID
GROUP BY p.Drname;