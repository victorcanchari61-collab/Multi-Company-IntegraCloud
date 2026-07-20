using Backend.Application.ERP.DTOs.Compras;
using Backend.SharedKernel.Services;

namespace Backend.Application.ERP.Documents.Compras;

public static class PurchaseOrderPdfBuilder
{
    public static DocumentRequest Build(PurchaseOrderDto order)
    {
        var statusLabel = order.Status switch
        {
            "Draft" => "Borrador",
            "Issued" => "Emitida",
            "Partial" => "Parcial",
            "Received" => "Recibida",
            "Closed" => "Cerrada",
            "Cancelled" => "Anulada",
            _ => order.Status
        };

        var fields = new List<DocumentField>
        {
            new("N° Orden", order.OrderNumber),
            new("Proveedor", order.SupplierName),
            new("Emisión", order.IssueDate.ToString("dd/MM/yyyy")),
            new("Esperada", order.ExpectedDate?.ToString("dd/MM/yyyy") ?? "-"),
            new("Estado", statusLabel),
        };

        var headers = new[] { "#", "Producto", "Cantidad", "Precio Unit.", "Subtotal" };
        var rows = order.Items.Select((item, idx) => new[]
        {
            (idx + 1).ToString(),
            item.ProductName,
            item.Quantity.ToString("N0"),
            $"S/ {item.UnitPrice:N2}",
            $"S/ {item.SubTotal:N2}",
        }).ToArray();

        var tables = new List<DocumentTable>
        {
            new("Productos", headers, rows),
        };

        decimal[] totals = [order.SubTotal, order.Tax, order.Total];

        return new DocumentRequest(
            "ORDEN DE COMPRA",
            null,
            fields,
            tables,
            totals,
            order.Notes
        );
    }
}
