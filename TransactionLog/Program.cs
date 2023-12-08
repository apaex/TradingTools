using Microsoft.Data.Sqlite;
using System.Data;
using TransactionLog;

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

    TransactionLogBuilder builder = new TransactionLogBuilder();

    using (SqliteDataReader reader = command.ExecuteReader())
    {
        while (reader.Read())
        {
            Trade trade = new Trade();

            var props = typeof(Trade).GetFields();

            foreach (var prop in props)
            {
                object? o = reader.GetValue(prop.Name);
                prop.SetValue(trade, o);
            }

            builder.Add(trade);
        }
    }
    builder.WriteCSV(Path.Combine(Path.GetDirectoryName(Settings.Default.db), "transaction_log.csv"));    
}