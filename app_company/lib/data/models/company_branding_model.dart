class CompanyBrandingModel {
  final String slug;
  final String name;
  final String? logoUrl;

  CompanyBrandingModel({
    required this.slug,
    required this.name,
    this.logoUrl,
  });

  factory CompanyBrandingModel.fromJson(Map<String, dynamic> json) {
    return CompanyBrandingModel(
      slug: json['slug'] as String,
      name: json['name'] as String,
      logoUrl: json['logoUrl'] as String?,
    );
  }
}
