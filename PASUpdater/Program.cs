namespace PASUpdater
{
    internal static class Program
    {
        /// <summary>
        ///  The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            // To customize application configuration such as set high DPI settings or default font,
            // see https://aka.ms/applicationconfiguration.
            ApplicationConfiguration.Initialize();            
            
            Settings.Default.Reload();
            if (!File.Exists(Settings.Default.InputFile))
            {
                OpenFileDialog ofd = new OpenFileDialog();
                ofd.Filter = "Excel files (*.xlsx)|*.xlsx|All files (*.*)|*.*";
                ofd.Title = "Выберите файл пассивной накопительной стратегии";
                if (ofd.ShowDialog() != DialogResult.OK)
                    return;
                Settings.Default.InputFile = ofd.FileName;
                Settings.Default.Save();
            }

            Application.Run(new MainForm());
        }
    }
}