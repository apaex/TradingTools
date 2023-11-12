using static PASUpdater.ExcelProcessor;

namespace PASUpdater
{
    public partial class MainForm : Form
    {
        ExcelProcessor proc = new ExcelProcessor(Settings.Default.InputFile);
        public MainForm()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {
            foreach (var quote in proc.TicketsList)
                listView1.Items.Add(quote.Key, quote.Key, -1);
        }

        private void button1_Click(object sender, EventArgs e)
        {
            stop = false;
            foreach (var quote in proc.TicketsList)
            {
                Update(quote.Key);
                if (stop) break;
            }
        }

        private void îáíîâèòüToolStripMenuItem_Click(object sender, EventArgs e)
        {
            stop = false;
            foreach (ListViewItem quote in listView1.SelectedItems)
            {
                Update(quote.Text);
                if (stop) break;
            }
        }

        private void button2_Click(object sender, EventArgs e)
        {

        }

        private void Update(string key)
        {
            Cursor.Current = Cursors.WaitCursor;
            string status = "OK";
            try
            {
                while (listView1.Items[key].SubItems.Count > 1) listView1.Items[key].SubItems.RemoveAt(1);

                ExcelProcessor.Data ticketInfo = proc.GetTicketInfo(key);
                listView1.Items[key].SubItems.Add(ticketInfo.lastDate.ToString());
                proc.Process(key);
            }
            catch (Exception ex)
            {
                status = ex.Message;
            }
            listView1.Items[key].SubItems.Add(status);

            Application.DoEvents();
            Cursor.Current = Cursors.Default;
        }

        bool stop = false;
        private void button2_Click_1(object sender, EventArgs e)
        {
            stop = true;
        }
    }
}