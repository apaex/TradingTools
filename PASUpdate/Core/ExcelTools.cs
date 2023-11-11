using Excel = Microsoft.Office.Interop.Excel;

internal static class ExcelTools
{
    public static Excel.Application AttachToApplication()
    {
        try
        {
            return (Excel.Application)Marshal2.GetActiveObject("Excel.Application");
        }
        catch (System.Runtime.InteropServices.COMException)
        {
        }

        return new Excel.Application();
    }

    public static Excel.Workbook AttachToWorkbook(Excel.Application excel, string fileName)
    {
        foreach (Excel.Workbook wb in excel.Workbooks)
            if (wb.FullName == fileName)
                return wb;

        return excel.Workbooks.Open(fileName, Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing, Type.Missing);
    }
}

