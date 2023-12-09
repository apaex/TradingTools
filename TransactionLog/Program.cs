using Microsoft.Data.Sqlite;
using System.Data;
using BlotterGen;


BlotterBuilder builder = new BlotterBuilder();

using (var connection = new SqliteConnection($"Data Source={Settings.Default.db}"))
{
    connection.Open();

    var command = connection.CreateCommand();
    command.CommandText =
    @"
        SELECT order_num, MIN(datetime) AS datetime, account, class_code, sec_code, price, SUM(qty) AS qty, ABS(SUM(price * qty)) AS summ, SUM(exchange_comission) AS exchange_comission , SUM(broker_comission) AS broker_comission FROM trades
        GROUP BY order_num
        ORDER BY datetime ASC
    ";


    using (SqliteDataReader reader = command.ExecuteReader())
    {
        while (reader.Read())
        {
            Transaction transaction = new Transaction();

            var props = typeof(Transaction).GetFields();

            foreach (var prop in props)
            {
                object? o = reader.GetValue(prop.Name);
                prop.SetValue(transaction, o);
            }

            builder.Add(transaction);
        }
    }
}    


builder.WriteCSV(Path.Combine(Path.GetDirectoryName(Settings.Default.db), "transaction_log.csv"));    
