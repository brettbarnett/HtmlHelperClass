using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Data;
using System.IO;

namespace BrettsTools;
public static class HtmlHelperClass
{
    public static void CreateHtmlDocumentFromDataTable(DataTable dataTable, string outputPath, string documentTitle)
    {
        if (dataTable == null || dataTable.Rows.Count == 0)
        {
            throw new ArgumentException("DataTable is null or empty.");
        }

        if (!AreDataTypesDefined(dataTable))
        {
            throw new ArgumentException("One or more DataColumn in the DataTable does not have a defined DataType.");
        }

        if (File.Exists(outputPath))
        {
            File.Delete(outputPath);
        }
        
        using (StreamWriter htmlWriter = File.CreateText(outputPath))
        {
            JsonSerializerSettings jsonSerializerSettings = new JsonSerializerSettings { 
                TypeNameHandling = TypeNameHandling.Auto,
                Formatting = Formatting.None
            };

            JObject dataTypesObject = [];
            foreach (DataColumn dc in dataTable.Columns)
            {
                dataTypesObject.Add(dc.ColumnName, dc.DataType.ToString());
            }
            string dataTypesJsonString = JsonConvert.SerializeObject(dataTypesObject, jsonSerializerSettings);

            string dataTableJsonString = JsonConvert.SerializeObject(dataTable, jsonSerializerSettings);

            WriteOpeningHeadSection(documentTitle, htmlWriter);
            string[] htmlStyleLines = File.ReadAllLines("stylesection.css");
            foreach (string line in htmlStyleLines)
            {
                htmlWriter.WriteLine(line);
            }

            htmlWriter.WriteLine("  <script>");
            htmlWriter.WriteLine("   const jsonTypes = " + dataTypesJsonString + ";");
            htmlWriter.WriteLine("   const jsonArray = " + dataTableJsonString + ";");
            string[] javascriptFunctionLines = File.ReadAllLines("javascriptfunctions.js");
            foreach (string line in javascriptFunctionLines)
            {
                htmlWriter.WriteLine(line);
            }
            htmlWriter.WriteLine("  </script>");
            WriteClosingHeadSection(htmlWriter);

            string[] htmlBodyLines = File.ReadAllLines("htmlbody.html");
            foreach (string line in htmlBodyLines)
            {
                htmlWriter.WriteLine(line);
            }

            WriteClosingHtmlTag(htmlWriter);
        }
    }

    public static DataTable CreateDataTableFromHtmlDocument(string htmlPath, string tableID)
    {
        HtmlAgilityPack.HtmlDocument htmlDocument = new HtmlAgilityPack.HtmlDocument();
        htmlDocument.Load(htmlPath);

        var htmlTable = htmlDocument.GetElementbyId(tableID);
        var tableHeadElement = htmlTable.Element("thead").Element("tr");
        var tableBodyElement = htmlTable.Element("tbody");

        DataTable dataTable = new DataTable();

        foreach (var tHeader in tableHeadElement.Elements("th"))
        {
            dataTable.Columns.Add(tHeader.InnerText);
        }

        foreach (var tRow in tableBodyElement.Elements("tr"))
        {
            DataRow dataRow = dataTable.NewRow();

            int i = 0;
            foreach (var tData in tRow.Elements("td"))
            {
                dataRow[i] = tData.InnerText;
                i++;
            }

            dataTable.Rows.Add(dataRow);
        }

        return dataTable;
    }

    private static bool AreDataTypesDefined(DataTable dataTable)
    {
        foreach (DataColumn dc in dataTable.Columns)
        {
            if (dc.DataType == null)
            {
                return false;
            }
        }
        return true;
    }

    private static void WriteOpeningHeadSection(string documentTitle, StreamWriter htmlWriter)
    {
        string[] htmlData = new string[]
        {
            "<!DOCTYPE html>",
            "<html lang=\"en\">",
            " <head>",
            "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />",
            "  <meta charset=\"UTF-8\">",
            "  <title>" + documentTitle + "</title>",
            "  <link href='https://fonts.googleapis.com/css?family=Libre+Barcode+128' rel='stylesheet'>"
        };

        foreach (string line in htmlData)
        {
            htmlWriter.WriteLine(line); ;
        }
    }

    private static void WriteClosingHeadSection(StreamWriter htmlWriter)
    {
        htmlWriter.WriteLine(" </head>");
    }

    private static void WriteClosingHtmlTag(StreamWriter htmlWriter)
    {
        htmlWriter.WriteLine("</html>");
    }
}
