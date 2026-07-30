SELECT * FROM dbo.DailyExpenceDetails;
SELECT * FROM dbo.BranchMaster;
SELECT * FROM dbo.ExpenceCategory;
SELECT * FROM dbo.ExpenceSubCategory;

SELECT 
    ded.ExpenceDetails,
    ded.ExpenceAmount,
    bm.BranchName,         
    ec.ExpenceCategory,    
    esc.SubCategory        
FROM dbo.ExpenceCategory ec
LEFT JOIN dbo.ExpenceSubCategory esc 
    ON ec.Id = esc.ExpCategoryId
LEFT JOIN dbo.BranchMaster bm 
    ON ec.Branchid = bm.branchid
LEFT JOIN dbo.DailyExpenceDetails ded
    ON ec.Id = ded.Expcategory;