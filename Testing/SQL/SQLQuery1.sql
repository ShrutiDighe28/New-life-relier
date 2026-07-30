SELECT * FROM dbo.DailyPerformTestCharges
SELECT * FROM dbo.CALENDAR
SELECT * FROM dbo.ExpenceCategory

SELECT 
    c.AD_DATE,               -- The date from the calendar
    c.holiday_1,             -- Shows if it is a holiday
    dptc.TestName,           -- The name of the test performed
    dptc.Amount              -- The charge amount
FROM dbo.CALENDAR c
LEFT JOIN dbo.DailyPerformTestCharges dptc
    ON c.AD_DATE = CAST(dptc.Createdon AS DATE); -- Matches the dates, ignoring the exact time