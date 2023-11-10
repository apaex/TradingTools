namespace QuotesUpdate
{
    partial class Form1
    {
        /// <summary>
        ///  Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        ///  Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        ///  Required method for Designer support - do not modify
        ///  the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            components = new System.ComponentModel.Container();
            listView1 = new ListView();
            columnHeader1 = new ColumnHeader();
            columnHeader2 = new ColumnHeader();
            columnHeader3 = new ColumnHeader();
            button1 = new Button();
            panel1 = new Panel();
            panel2 = new Panel();
            contextMenuStrip1 = new ContextMenuStrip(components);
            обновитьToolStripMenuItem = new ToolStripMenuItem();
            panel1.SuspendLayout();
            panel2.SuspendLayout();
            contextMenuStrip1.SuspendLayout();
            SuspendLayout();
            // 
            // listView1
            // 
            listView1.Columns.AddRange(new ColumnHeader[] { columnHeader1, columnHeader2, columnHeader3 });
            listView1.ContextMenuStrip = contextMenuStrip1;
            listView1.Dock = DockStyle.Fill;
            listView1.FullRowSelect = true;
            listView1.GridLines = true;
            listView1.Location = new Point(0, 0);
            listView1.Name = "listView1";
            listView1.Size = new Size(1259, 828);
            listView1.TabIndex = 0;
            listView1.UseCompatibleStateImageBehavior = false;
            listView1.View = View.Details;
            // 
            // columnHeader1
            // 
            columnHeader1.Text = "Инструмент";
            columnHeader1.Width = 260;
            // 
            // columnHeader2
            // 
            columnHeader2.Text = "ID";
            columnHeader2.Width = 260;
            // 
            // columnHeader3
            // 
            columnHeader3.Text = "Статус";
            columnHeader3.Width = 260;
            // 
            // button1
            // 
            button1.Location = new Point(24, 39);
            button1.Name = "button1";
            button1.Size = new Size(213, 56);
            button1.TabIndex = 2;
            button1.Text = "Старт";
            button1.UseVisualStyleBackColor = true;
            button1.Click += button1_Click;
            // 
            // panel1
            // 
            panel1.Controls.Add(button1);
            panel1.Dock = DockStyle.Right;
            panel1.Location = new Point(1010, 0);
            panel1.Name = "panel1";
            panel1.Size = new Size(249, 828);
            panel1.TabIndex = 4;
            // 
            // panel2
            // 
            panel2.Controls.Add(listView1);
            panel2.Dock = DockStyle.Fill;
            panel2.Location = new Point(0, 0);
            panel2.Name = "panel2";
            panel2.Size = new Size(1259, 828);
            panel2.TabIndex = 5;
            // 
            // contextMenuStrip1
            // 
            contextMenuStrip1.ImageScalingSize = new Size(24, 24);
            contextMenuStrip1.Items.AddRange(new ToolStripItem[] { обновитьToolStripMenuItem });
            contextMenuStrip1.Name = "contextMenuStrip1";
            contextMenuStrip1.Size = new Size(166, 36);
            // 
            // обновитьToolStripMenuItem
            // 
            обновитьToolStripMenuItem.Name = "обновитьToolStripMenuItem";
            обновитьToolStripMenuItem.Size = new Size(165, 32);
            обновитьToolStripMenuItem.Text = "Обновить";
            обновитьToolStripMenuItem.Click += обновитьToolStripMenuItem_Click;
            // 
            // Form1
            // 
            AutoScaleDimensions = new SizeF(10F, 25F);
            AutoScaleMode = AutoScaleMode.Font;
            ClientSize = new Size(1259, 828);
            Controls.Add(panel1);
            Controls.Add(panel2);
            Name = "Form1";
            Text = "Form1";
            Load += Form1_Load;
            panel1.ResumeLayout(false);
            panel2.ResumeLayout(false);
            contextMenuStrip1.ResumeLayout(false);
            ResumeLayout(false);
        }

        #endregion

        private ListView listView1;
        private ColumnHeader columnHeader1;
        private ColumnHeader columnHeader2;
        private ColumnHeader columnHeader3;
        private Button button1;
        private Panel panel1;
        private Panel panel2;
        private ContextMenuStrip contextMenuStrip1;
        private ToolStripMenuItem обновитьToolStripMenuItem;
    }
}