using Backend.SharedKernel.Services;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Backend.Infrastructure.ERP.Services;

internal sealed class QuestPdfService : IPdfService
{
    public byte[] GeneratePdf(DocumentRequest request)
    {
        return Document.Create(document =>
        {
            document.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Arial"));

                page.Header()
                    .Column(col =>
                    {
                        col.Item().AlignCenter().Text(request.Title).SemiBold().FontSize(18).FontColor(Colors.Blue.Darken2);
                        if (request.Subtitle != null)
                            col.Item().AlignCenter().Text(request.Subtitle).FontSize(11).FontColor(Colors.Grey.Darken1);
                        col.Item().PaddingBottom(8).LineHorizontal(1).LineColor(Colors.Grey.Medium);
                    });

                page.Content()
                    .Column(col =>
                    {
                        col.Spacing(12);

                        if (request.Fields.Count > 0)
                        {
                            col.Item().Table(table =>
                            {
                                var half = (request.Fields.Count + 1) / 2;
                                table.ColumnsDefinition(cols =>
                                {
                                    cols.RelativeColumn();
                                    cols.RelativeColumn();
                                });

                                for (var i = 0; i < request.Fields.Count; i++)
                                {
                                    var idx = i;
                                    table.Cell().PaddingBottom(4).Text(request.Fields[idx].Label).FontSize(8).FontColor(Colors.Grey.Darken2);
                                    table.Cell().PaddingBottom(4).Text(request.Fields[idx].Value).FontSize(10).SemiBold();
                                }
                            });
                        }

                        foreach (var tableDef in request.Tables)
                        {
                            col.Item().Table(table =>
                            {
                                table.ColumnsDefinition(cols =>
                                {
                                    foreach (var _ in tableDef.Headers)
                                        cols.RelativeColumn();
                                });

                                table.Header(header =>
                                {
                                    foreach (var h in tableDef.Headers)
                                    {
                                        header.Cell().Background(Colors.Blue.Darken2).Padding(5)
                                            .Text(h).FontSize(9).FontColor(Colors.White).SemiBold().AlignCenter();
                                    }
                                });

                                foreach (var row in tableDef.Rows)
                                {
                                    var rowIdx = Array.IndexOf(tableDef.Rows, row);
                                    foreach (var cell in row)
                                    {
                                        var cellIdx = Array.IndexOf(row, cell);
                                        table.Cell().Padding(4)
                                            .Background(rowIdx % 2 == 0 ? Colors.White : Colors.Grey.Lighten4)
                                            .Text(cell).FontSize(9).AlignRight();
                                    }
                                }
                            });
                        }

                        if (request.Totals is { Length: > 0 })
                        {
                            col.Item().PaddingTop(8).AlignRight().Column(totals =>
                            {
                                var labels = request.Totals.Length == 3
                                    ? ["Subtotal", "IGV (18%)", "Total"]
                                    : request.Totals.Select(_ => "").ToArray();
                                for (var i = 0; i < request.Totals.Length; i++)
                                {
                                    var isLast = i == request.Totals.Length - 1;
                    totals.Item().Row(row =>
                    {
                        row.RelativeItem().AlignRight().Text(labels.ElementAtOrDefault(i) ?? "").FontSize(10).SemiBold();
                        row.ConstantItem(100).AlignRight().Text($"S/ {request.Totals[i]:N2}").FontSize(10).SemiBold();
                    });
                                }
                            });
                        }
                    });

                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("Página ").FontSize(8).FontColor(Colors.Grey.Darken1);
                        x.CurrentPageNumber().FontSize(8).FontColor(Colors.Grey.Darken1);
                        x.Span(" de ").FontSize(8).FontColor(Colors.Grey.Darken1);
                        x.TotalPages().FontSize(8).FontColor(Colors.Grey.Darken1);
                        if (request.Footer != null)
                        {
                            x.Span($"  |  {request.Footer}").FontSize(8).FontColor(Colors.Grey.Darken1);
                        }
                    });
            });
        }).GeneratePdf();
    }
}
