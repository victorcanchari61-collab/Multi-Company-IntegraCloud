import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { LucideClipboardList, LucideCoins, LucideFileText } from '@lucide/angular';
import { ApiError } from '@/app/core/http/api-error';
import { Dialog } from '@/app/shared/ui/dialog/dialog';
import { ButtonDirective } from '@/app/shared/ui/directives/button.directive';
import { InputDirective } from '@/app/shared/ui/directives/input.directive';
import { LabelDirective } from '@/app/shared/ui/directives/label.directive';
import { Input } from '@/app/shared/ui/input/input';
import { TabIcon } from '@/app/shared/ui/tabs/tab-icon.directive';
import { type TabItem, Tabs } from '@/app/shared/ui/tabs/tabs';
import type { Brand, Category, Product, ProductRequest, Subbrand, Subcategory, UnitOfMeasure } from '../../models/catalog.model';
import { CatalogService } from '../../services/catalog.service';
import { ErpProductsService } from '../../services/erp-products.service';

type ProductTab = 'datos' | 'precios' | 'info';

const TABS: TabItem[] = [
  { key: 'datos', label: 'Datos iniciales' },
  { key: 'precios', label: 'Lote y precios' },
  { key: 'info', label: 'Información adicional' },
];

const IMAGE_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const SHEET_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/** '' → null; string numérica → number (los inputs numéricos entregan strings). */
function toNum(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function toNull(value: string): string | null {
  return value.trim() || null;
}

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    Dialog,
    ButtonDirective,
    Input,
    InputDirective,
    LabelDirective,
    Tabs,
    TabIcon,
    LucideClipboardList,
    LucideCoins,
    LucideFileText,
  ],
  templateUrl: './product-form-dialog.html',
})
export class ProductFormDialog {
  readonly open = input(false);
  /** Producto a editar (null = crear). Trae todos los campos del listado. */
  readonly product = input<Product | null>(null);

  readonly openChange = output<boolean>();
  readonly saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly productsService = inject(ErpProductsService);
  private readonly catalog = inject(CatalogService);

  protected readonly tabs = TABS;
  protected readonly activeTab = signal<ProductTab>('datos');
  protected readonly isEdit = computed(() => this.product() !== null);
  protected readonly saving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Maestros para los selects (se cargan al abrir).
  protected readonly categories = signal<Category[]>([]);
  protected readonly subcategories = signal<Subcategory[]>([]);
  protected readonly brands = signal<Brand[]>([]);
  protected readonly subbrands = signal<Subbrand[]>([]);
  protected readonly units = signal<UnitOfMeasure[]>([]);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    sku: [''],
    barcode: [''],
    isActive: this.fb.nonNullable.control<boolean>(true),
    description: [''],
    ticketDescription: [''],
    categoryId: this.fb.control<string | null>(null),
    subcategoryId: this.fb.control<string | null>(null),
    brandId: this.fb.control<string | null>(null),
    subbrandId: this.fb.control<string | null>(null),
    unitOfMeasureId: this.fb.control<string | null>(null),
    stockMin: [''],
    stockMax: [''],
    salePrice: [''],
    costPrice: [''],
    loteNumber: [''],
    loteExpiry: [''],
    loteStock: [''],
    loteStockFraction: [''],
    technicalAction: [''],
    imageUrl: this.fb.control<string | null>(null),
    technicalSheetUrl: this.fb.control<string | null>(null),
  });

  // Los selects dependientes se filtran en cliente (igual que en React).
  private readonly selectedCategoryId = signal<string | null>(null);
  private readonly selectedBrandId = signal<string | null>(null);
  protected readonly subcategoryOptions = computed(() => {
    const categoryId = this.selectedCategoryId();
    return categoryId ? this.subcategories().filter((s) => s.categoryId === categoryId) : [];
  });
  protected readonly subbrandOptions = computed(() => {
    const brandId = this.selectedBrandId();
    return brandId ? this.subbrands().filter((s) => s.brandId === brandId) : [];
  });

  protected readonly imagePreview = signal<string | null>(null);
  protected readonly sheetName = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.open()) void this.initialize();
    });

    this.form.controls.categoryId.valueChanges.pipe(takeUntilDestroyed()).subscribe((categoryId) => {
      this.selectedCategoryId.set(categoryId);
      const sub = this.form.controls.subcategoryId.value;
      if (sub && !this.subcategories().some((s) => s.id === sub && s.categoryId === categoryId)) {
        this.form.controls.subcategoryId.setValue(null);
      }
    });
    this.form.controls.brandId.valueChanges.pipe(takeUntilDestroyed()).subscribe((brandId) => {
      this.selectedBrandId.set(brandId);
      const sub = this.form.controls.subbrandId.value;
      if (sub && !this.subbrands().some((s) => s.id === sub && s.brandId === brandId)) {
        this.form.controls.subbrandId.setValue(null);
      }
    });
  }

  private async initialize(): Promise<void> {
    const product = this.product();

    this.errorMessage.set(null);
    this.activeTab.set('datos');
    this.imagePreview.set(null);
    this.sheetName.set(null);
    this.form.reset({
      name: product?.name ?? '',
      sku: product?.sku ?? '',
      barcode: product?.barcode ?? '',
      isActive: product?.isActive ?? true,
      description: product?.description ?? '',
      ticketDescription: product?.ticketDescription ?? '',
      categoryId: product?.categoryId ?? null,
      subcategoryId: product?.subcategoryId ?? null,
      brandId: product?.brandId ?? null,
      subbrandId: product?.subbrandId ?? null,
      unitOfMeasureId: product?.unitOfMeasureId ?? null,
      stockMin: product?.stockMin != null ? String(product.stockMin) : '',
      stockMax: product?.stockMax != null ? String(product.stockMax) : '',
      salePrice: product?.salePrice != null ? String(product.salePrice) : '',
      costPrice: product?.costPrice != null ? String(product.costPrice) : '',
      loteNumber: product?.loteNumber ?? '',
      loteExpiry: product?.loteExpiry?.slice(0, 10) ?? '',
      loteStock: product?.loteStock != null ? String(product.loteStock) : '',
      loteStockFraction: product?.loteStockFraction != null ? String(product.loteStockFraction) : '',
      technicalAction: product?.technicalAction ?? '',
      imageUrl: null,
      technicalSheetUrl: null,
    });

    try {
      const [categories, subcategories, brands, subbrands, units] = await Promise.all([
        firstValueFrom(this.catalog.getCategories()),
        firstValueFrom(this.catalog.getSubcategories()),
        firstValueFrom(this.catalog.getBrands()),
        firstValueFrom(this.catalog.getSubbrands()),
        firstValueFrom(this.catalog.getUnits()),
      ]);
      this.categories.set(categories);
      this.subcategories.set(subcategories);
      this.brands.set(brands);
      this.subbrands.set(subbrands);
      this.units.set(units);
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudieron cargar los catálogos.');
    }

    // Imagen y ficha viajan fuera del listado: se piden aparte solo al editar.
    if (product) {
      try {
        const media = await firstValueFrom(this.productsService.getProductMedia(product.id));
        this.form.patchValue({ imageUrl: media.imageUrl, technicalSheetUrl: media.technicalSheetUrl });
        this.imagePreview.set(media.imageUrl);
        if (media.technicalSheetUrl) this.sheetName.set('Ficha técnica cargada');
      } catch {
        // Sin media no se bloquea la edición del resto del producto.
      }
    }
  }

  protected onImageFile(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    inputEl.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      this.errorMessage.set('La imagen debe ser PNG, JPG o WebP.');
      return;
    }
    if (file.size > IMAGE_MAX_BYTES) {
      this.errorMessage.set('La imagen no puede superar los 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.form.patchValue({ imageUrl: dataUrl });
      this.imagePreview.set(dataUrl);
      this.errorMessage.set(null);
    };
    reader.readAsDataURL(file);
  }

  protected removeImage(): void {
    this.form.patchValue({ imageUrl: null });
    this.imagePreview.set(null);
  }

  protected onSheetFile(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    inputEl.value = '';
    if (!file) return;
    if (file.type !== 'application/pdf') {
      this.errorMessage.set('La ficha técnica debe ser un PDF.');
      return;
    }
    if (file.size > SHEET_MAX_BYTES) {
      this.errorMessage.set('La ficha técnica no puede superar los 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.form.patchValue({ technicalSheetUrl: reader.result as string });
      this.sheetName.set(file.name);
      this.errorMessage.set(null);
    };
    reader.readAsDataURL(file);
  }

  protected removeSheet(): void {
    this.form.patchValue({ technicalSheetUrl: null });
    this.sheetName.set(null);
  }

  protected setTab(tab: string): void {
    this.activeTab.set(tab as ProductTab);
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.activeTab.set('datos');
      return;
    }

    this.errorMessage.set(null);
    this.saving.set(true);

    const raw = this.form.getRawValue();
    const payload: ProductRequest = {
      name: raw.name,
      sku: toNull(raw.sku),
      barcode: toNull(raw.barcode),
      isActive: raw.isActive,
      description: toNull(raw.description),
      ticketDescription: toNull(raw.ticketDescription),
      categoryId: raw.categoryId,
      subcategoryId: raw.subcategoryId,
      brandId: raw.brandId,
      subbrandId: raw.subbrandId,
      unitOfMeasureId: raw.unitOfMeasureId,
      stockMin: toNum(raw.stockMin),
      stockMax: toNum(raw.stockMax),
      salePrice: toNum(raw.salePrice),
      costPrice: toNum(raw.costPrice),
      loteNumber: toNull(raw.loteNumber),
      loteExpiry: toNull(raw.loteExpiry),
      loteStock: toNum(raw.loteStock),
      loteStockFraction: toNum(raw.loteStockFraction),
      technicalAction: toNull(raw.technicalAction),
      imageUrl: raw.imageUrl,
      technicalSheetUrl: raw.technicalSheetUrl,
    };

    try {
      const product = this.product();
      if (product) await firstValueFrom(this.productsService.updateProduct(product.id, payload));
      else await firstValueFrom(this.productsService.createProduct(payload));
      this.saved.emit();
      this.openChange.emit(false);
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudo guardar el producto.');
    } finally {
      this.saving.set(false);
    }
  }
}
