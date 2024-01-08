using Microsoft.Data.Sqlite;
using System.Data;
using JournalGen;
using System.Reflection;


Journal builder = new Journal();

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

            var fields = typeof(Transaction).GetFields(BindingFlags.Public | BindingFlags.Instance);

            foreach (var field in fields)
            {
                object? o = reader.GetValue(field.Name);
                TypedReference reference = __makeref(transaction);
                field.SetValueDirect(reference, o);
            }

            builder.Add(transaction);
        }
    }
}


string path = Path.Combine(Path.GetDirectoryName(Settings.Default.db), "journal.csv");
Console.WriteLine("Сохранение "+ path);
builder.WriteCSVTemplate(path);
builder.WriteCSV(Path.Combine(Path.GetDirectoryName(Settings.Default.db), "raw.csv"));
