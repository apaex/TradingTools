﻿namespace JournalGen;

internal class Journal
{
    public struct Trade
    {
        public DateTime datetime_open;
        public string account;
        public string class_code;
        public string sec_code;

        public string order_num_open;
        public long qty_open;
        public double summ_open;
        public double exchange_comission_open;
        public double broker_comission_open;

        public DateTime datetime_close;
        public string order_num_close;
        public long qty_close;
        public double summ_close;
        public double exchange_comission_close;
        public double broker_comission_close;

        public void AddOpenOrderNum(long order_num)
        {
            order_num_open += order_num.ToString() + "|";
        }

        public void AddCloseOrderNum(long order_num)
        {
            order_num_close += order_num.ToString() + "|";
        }    
    }


    List<Trade> journal = new();

    public void Add(Transaction transaction)
    {
        int openTradeIndex = journal.FindIndex(t => 
                (t.account == transaction.account)
                && (t.class_code == transaction.class_code)
                && (t.sec_code == transaction.sec_code) 
                && (t.qty_open != -t.qty_close));

        if (openTradeIndex < 0)
        {
            journal.Add(new Trade
            {
                datetime_open = Transaction.ToDate(transaction.datetime),
                account = transaction.account,
                class_code = transaction.class_code,
                sec_code = transaction.sec_code,
            });
            openTradeIndex = journal.Count - 1;
        }

        long qty = transaction.qty;
        var ot = journal[openTradeIndex];

        if (ot.qty_open == 0 || (Math.Sign(qty) == Math.Sign(ot.qty_open)))
        {
            ot.qty_open += qty;
            ot.summ_open += transaction.summ;
            ot.exchange_comission_open += transaction.exchange_comission;
            ot.broker_comission_open += transaction.broker_comission;
            ot.AddOpenOrderNum(transaction.order_num);

            journal[openTradeIndex] = ot;
        }
        else
        {
            long q = (ot.qty_close + qty != -ot.qty_open) ? -(ot.qty_open + ot.qty_close) : qty;

            ot.qty_close += q;
            ot.summ_close += transaction.summ / qty * q;
            ot.exchange_comission_close += transaction.exchange_comission;
            ot.broker_comission_close += transaction.broker_comission;
            ot.datetime_close = Transaction.ToDate(transaction.datetime);
            ot.AddCloseOrderNum(transaction.order_num);

            journal[openTradeIndex] = ot;

            if (q != qty)
            {
                q = qty - q;
                transaction.qty = q;
                transaction.summ = transaction.summ / qty * q;
                transaction.exchange_comission = transaction.exchange_comission / qty * q;
                transaction.broker_comission = transaction.broker_comission / qty * q;
                Add(transaction);
            }
        }
    }


    public void WriteCSV(string filename)
    {
        StreamWriter csv = new StreamWriter(filename);

        List<string> row = new();

        var props = typeof(Trade).GetFields();

        foreach (var prop in props)
             row.Add(prop.Name); 

        csv.WriteLine(string.Join(";", row));


        foreach (Trade trade in journal) 
        {
            row = new();

            foreach (var prop in props)
            {
                if (prop.FieldType == typeof(string))
                    row.Add( "\"" + prop.GetValue(trade) + "\"");
                else
                    row.Add(prop.GetValue(trade).ToString());
            }

            csv.WriteLine(string.Join(";", row));
        }
        
        csv.Close();
    }
};
