namespace FinamUpdate
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            ExcelProcessor proc = new ExcelProcessor(@"C:\Users\apaex\Downloads\Telegram Desktop\ќбразец_пассивной_накопительной_стратегии.xlsx");
            proc.Process();

            //Finam dw = new Finam();
            //dw.Load(DateTime.Now.AddMonths(-12), DateTime.Now);
        }
    }
}