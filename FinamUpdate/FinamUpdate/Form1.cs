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
            Finam dw = new Finam();
            dw.Load(DateTime.Now.AddDays(-4), DateTime.Now.AddDays(-3));
        }
    }
}