namespace Backend.SharedKernel.Services;

public interface IPdfService
{
    byte[] GeneratePdf(DocumentRequest request);
}

public sealed record DocumentRequest(
    string Title,
    string? Subtitle,
    IReadOnlyList<DocumentField> Fields,
    IReadOnlyList<DocumentTable> Tables,
    decimal[]? Totals,
    string? Footer
);

public sealed record DocumentField(string Label, string Value);

public sealed record DocumentTable(
    string? Title,
    string[] Headers,
    string[][] Rows
);
