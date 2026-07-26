import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, type FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { LucideCirclePlus, LucideClipboardList, LucideCoins, LucideFileText, LucidePlus, LucideTrash2 } from '@lucide/angular';
import { ApiError } from '@/app/core/http/api-error';
import { Dialog } from '@/app/shared/ui/dialog/dialog';
import { ButtonDirective } from '@/app/shared/ui/directives/button.directive';
import { CheckboxDirective } from '@/app/shared/ui/directives/checkbox.directive';
import { InputDirective } from '@/app/shared/ui/directives/input.directive';
import { LabelDirective } from '@/app/shared/ui/directives/label.directive';
import { Input } from '@/app/shared/ui/input/input';
import { TabIcon } from '@/app/shared/ui/tabs/tab-icon.directive';
import { type TabItem, Tabs } from '@/app/shared/ui/tabs/tabs';
import type {
  Brand,
  Category,
  Currency,
  PriceList,
  Product,
  ProductPresentation,
  ProductPresentationRequest,
  ProductRequest,
  Subbrand,
  Subcategory,
  UnitOfMeasure,
} from '../../models/catalog.model';
import { CatalogService } from '../../services/catalog.service';
import { ErpProductsService } from '../../services/erp-products.service';

type ProductTab = 'datos' | 'precios' | 'info';

// Igual que el ProductFormDialog de React: 3 pestañas.
const TABS: TabItem[] = [
  { key: 'datos', label: 'Datos iniciales' },
  { key: 'precios', label: 'Lote y precios' },
  { key: 'info', label: 'Información adicional' },
];

/** Formatos sugeridos para la unidad derivada (el nombre es texto libre: MILLAR, 1/2 MILLAR, ...). */
export const SALE_FORMATS = ['UNIDAD', 'CAJA', 'BOLSA', 'PACK', 'DOCENA', 'MEDIA DOCENA', 'MILLAR', '1/2 MILLAR', '1/4 MILLAR'];

type QuickCreateType = 'categoria' | 'subcategoria' | 'marca' | 'submarca' | 'unidad';

const QUICK_TITLES: Record<QuickCreateType, string> = {
  categoria: 'Nueva categoría',
  subcategoria: 'Nueva subcategoría',
  marca: 'Nueva marca',
  submarca: 'Nueva submarca',
  unidad: 'Nueva unidad de medida',
};

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

interface PriceRowValue {
  presentationId: string | null;
  name: string;
  factor: string;
  complementaryProductId: string | null;
  complementaryQuantity: string;
  purchasePrice: string;
  markupPercentage: string;
}

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    Dialog,
    ButtonDirective,
    CheckboxDirective,
    Input,
    InputDirective,
    LabelDirective,
    Tabs,
    TabIcon,
    LucideClipboardList,
    LucideCoins,
    LucideFileText,
    LucidePlus,
    LucideCirclePlus,
    LucideTrash2,
  ],
  templateUrl: './product-form-dialog.html',
})
export class ProductFormDialog {
  readonly open = input(false);
  /** Producto a editar (null = crear). */
  readonly product = input<Product | null>(null);

  readonly openChange = output<boolean>();
  readonly saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly productsService = inject(ErpProductsService);
  private readonly catalog = inject(CatalogService);

  protected readonly tabs = TABS;
  protected readonly saleFormats = SALE_FORMATS;
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
  protected readonly allProducts = signal<Product[]>([]);
  private readonly priceLists = signal<PriceList[]>([]);
  private readonly currencies = signal<Currency[]>([]);

  // Los precios se persisten contra la primera lista de precio y moneda activas (igual que en
  // la app de referencia). Si no existen, el grid se guarda como presentaciones sin precio.
  protected readonly canPersistPrices = computed(() => this.priceLists().length > 0 && this.currencies().length > 0);

  protected readonly form = this.fb.nonNullable.group({
    // code/autoCode: solo UI (paridad con React) — el backend no tiene campo "code" todavía.
    code: [{ value: '', disabled: true }],
    autoCode: this.fb.nonNullable.control<boolean>(true),
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
    unitOfMeasureId: this.fb.control<string | null>(null, [Validators.required]),
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

  // Grid "Detalle de precios": cada fila es una unidad derivada (presentación) con su
  // precio de compra y % de venta. De acá sale el precio — no hay campo suelto.
  protected readonly priceRows = this.fb.array<FormGroup>([]);
  private loadedPresentations: ProductPresentation[] = [];

  // Selects dependientes filtrados en cliente.
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

  // ── Modal de creación rápida (los "+" verdes junto a cada select) ──
  protected readonly quickType = signal<QuickCreateType | null>(null);
  protected readonly quickTitle = computed(() => {
    const type = this.quickType();
    return type ? QUICK_TITLES[type] : '';
  });
  protected readonly quickSaving = signal(false);
  protected readonly quickError = signal<string | null>(null);
  protected readonly quickForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    abbreviation: [''],
    parentId: this.fb.control<string | null>(null),
  });

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

    // "Código automático": marcado = el código lo genera el sistema, el input se limpia y bloquea.
    this.form.controls.autoCode.valueChanges.pipe(takeUntilDestroyed()).subscribe((auto) => {
      const codeControl = this.form.controls.code;
      if (auto) {
        codeControl.setValue('');
        codeControl.disable();
      } else {
        codeControl.enable();
      }
    });
  }

  private buildPriceRow(seed?: Partial<PriceRowValue>): FormGroup {
    return this.fb.nonNullable.group({
      presentationId: this.fb.control<string | null>(seed?.presentationId ?? null),
      name: [seed?.name ?? '', [Validators.required]],
      factor: [seed?.factor ?? '1', [Validators.required]],
      complementaryProductId: this.fb.control<string | null>(seed?.complementaryProductId ?? null),
      complementaryQuantity: [seed?.complementaryQuantity ?? ''],
      purchasePrice: [seed?.purchasePrice ?? ''],
      markupPercentage: [seed?.markupPercentage ?? ''],
    });
  }

  protected addPriceRow(): void {
    this.priceRows.push(this.buildPriceRow());
  }

  protected removePriceRow(index: number): void {
    this.priceRows.removeAt(index);
  }

  private async initialize(): Promise<void> {
    const product = this.product();

    this.errorMessage.set(null);
    this.activeTab.set('datos');
    this.imagePreview.set(null);
    this.sheetName.set(null);
    this.quickType.set(null);
    this.priceRows.clear();
    this.loadedPresentations = [];
    this.form.reset({
      code: '',
      autoCode: true,
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
      const [categories, subcategories, brands, subbrands, units, priceLists, currencies, products] =
        await Promise.all([
          firstValueFrom(this.catalog.getCategories()),
          firstValueFrom(this.catalog.getSubcategories()),
          firstValueFrom(this.catalog.getBrands()),
          firstValueFrom(this.catalog.getSubbrands()),
          firstValueFrom(this.catalog.getUnits()),
          firstValueFrom(this.catalog.getPriceLists()),
          firstValueFrom(this.catalog.getCurrencies()),
          firstValueFrom(this.productsService.getProducts()),
        ]);
      this.categories.set(categories);
      this.subcategories.set(subcategories);
      this.brands.set(brands);
      this.subbrands.set(subbrands);
      this.units.set(units);
      this.priceLists.set(priceLists.filter((p) => p.isActive));
      this.currencies.set(currencies.filter((c) => c.isActive));
      this.allProducts.set(products.filter((p) => p.id !== product?.id));
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudieron cargar los catálogos.');
    }

    if (product) {
      await this.loadEditExtras(product.id);
    }
  }

  /** Al editar: media + presentaciones + precios existentes para poblar el grid. */
  private async loadEditExtras(productId: string): Promise<void> {
    try {
      const media = await firstValueFrom(this.productsService.getProductMedia(productId));
      this.form.patchValue({ imageUrl: media.imageUrl, technicalSheetUrl: media.technicalSheetUrl });
      this.imagePreview.set(media.imageUrl);
      if (media.technicalSheetUrl) this.sheetName.set('Ficha técnica cargada');
    } catch {
      // Sin media no se bloquea el resto.
    }

    try {
      const [presentations, prices] = await Promise.all([
        firstValueFrom(this.productsService.getPresentations(productId)),
        firstValueFrom(this.productsService.getPrices(productId)),
      ]);
      this.loadedPresentations = presentations;
      const priceByPresentation = new Map(prices.map((p) => [p.presentationId, p]));
      for (const presentation of [...presentations].sort((a, b) => a.sortOrder - b.sortOrder)) {
        const price = priceByPresentation.get(presentation.id);
        this.priceRows.push(
          this.buildPriceRow({
            presentationId: presentation.id,
            name: presentation.name,
            factor: String(presentation.factor),
            complementaryProductId: presentation.complementaryProductId,
            complementaryQuantity: presentation.complementaryQuantity ? String(presentation.complementaryQuantity) : '',
            purchasePrice: price?.purchasePrice != null ? String(price.purchasePrice) : '',
            markupPercentage: presentation.markupPercentage ? String(presentation.markupPercentage) : '',
          }),
        );
      }
    } catch {
      // El grid queda vacío si el endpoint falla; el producto sigue siendo editable.
    }
  }

  // ── Creación rápida ──

  protected openQuickCreate(type: QuickCreateType): void {
    this.quickError.set(null);
    const parentId =
      type === 'subcategoria'
        ? this.form.controls.categoryId.value
        : type === 'submarca'
          ? this.form.controls.brandId.value
          : null;
    this.quickForm.reset({ name: '', description: '', abbreviation: '', parentId });
    this.quickType.set(type);
  }

  protected quickParentOptions(): { id: string; name: string }[] {
    const type = this.quickType();
    if (type === 'subcategoria') return this.categories().filter((c) => c.isActive);
    if (type === 'submarca') return this.brands().filter((b) => b.isActive);
    return [];
  }

  protected async saveQuickCreate(): Promise<void> {
    const type = this.quickType();
    if (!type) return;
    const { name, description, abbreviation, parentId } = this.quickForm.getRawValue();
    if (!name.trim()) {
      this.quickForm.markAllAsTouched();
      return;
    }
    if ((type === 'subcategoria' || type === 'submarca') && !parentId) {
      this.quickError.set('Selecciona el padre.');
      return;
    }
    if (type === 'unidad' && !abbreviation.trim()) {
      this.quickError.set('La abreviatura es requerida.');
      return;
    }

    this.quickSaving.set(true);
    this.quickError.set(null);
    const desc = description.trim() || null;

    try {
      switch (type) {
        case 'categoria': {
          const id = await firstValueFrom(this.catalog.createCategory({ name, description: desc }));
          this.categories.set(await firstValueFrom(this.catalog.getCategories()));
          this.form.controls.categoryId.setValue(id);
          break;
        }
        case 'subcategoria': {
          const id = await firstValueFrom(this.catalog.createSubcategory({ categoryId: parentId!, name, description: desc }));
          this.subcategories.set(await firstValueFrom(this.catalog.getSubcategories()));
          this.form.controls.categoryId.setValue(parentId);
          this.form.controls.subcategoryId.setValue(id);
          break;
        }
        case 'marca': {
          const id = await firstValueFrom(this.catalog.createBrand({ name, description: desc }));
          this.brands.set(await firstValueFrom(this.catalog.getBrands()));
          this.form.controls.brandId.setValue(id);
          break;
        }
        case 'submarca': {
          const id = await firstValueFrom(this.catalog.createSubbrand({ brandId: parentId!, name, description: desc }));
          this.subbrands.set(await firstValueFrom(this.catalog.getSubbrands()));
          this.form.controls.brandId.setValue(parentId);
          this.form.controls.subbrandId.setValue(id);
          break;
        }
        case 'unidad': {
          const id = await firstValueFrom(this.catalog.createUnit({ name, abbreviation }));
          this.units.set(await firstValueFrom(this.catalog.getUnits()));
          this.form.controls.unitOfMeasureId.setValue(id);
          break;
        }
      }
      this.quickType.set(null);
    } catch (error) {
      this.quickError.set(error instanceof ApiError ? error.message : 'No se pudo crear.');
    } finally {
      this.quickSaving.set(false);
    }
  }

  // ── Archivos ──

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

  // ── Guardado: producto → diff de presentaciones → precios ──

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid || this.priceRows.invalid) {
      this.form.markAllAsTouched();
      this.priceRows.markAllAsTouched();
      // Salta a la pestaña donde está el error.
      this.activeTab.set(this.form.invalid ? 'datos' : 'precios');
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
      let productId: string;
      if (product) {
        await firstValueFrom(this.productsService.updateProduct(product.id, payload));
        productId = product.id;
      } else {
        productId = await firstValueFrom(this.productsService.createProduct(payload));
      }

      await this.syncPresentationsAndPrices(productId);

      this.saved.emit();
      this.openChange.emit(false);
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudo guardar el producto.');
    } finally {
      this.saving.set(false);
    }
  }

  private async syncPresentationsAndPrices(productId: string): Promise<void> {
    const rows = this.priceRows.getRawValue() as PriceRowValue[];

    // Presentaciones quitadas del grid → se eliminan.
    const keptIds = new Set(rows.map((row) => row.presentationId).filter(Boolean));
    for (const existing of this.loadedPresentations) {
      if (!keptIds.has(existing.id)) {
        await firstValueFrom(this.productsService.deletePresentation(productId, existing.id));
      }
    }

    // Filas del grid → crear o actualizar, preservando el orden visual.
    const presentationIds: string[] = [];
    for (const [index, row] of rows.entries()) {
      const request: ProductPresentationRequest = {
        name: row.name.trim(),
        unitOfMeasureId: null,
        factor: toNum(row.factor) ?? 1,
        isBase: false,
        sortOrder: index,
        complementaryProductId: row.complementaryProductId,
        complementaryQuantity: toNum(row.complementaryQuantity) ?? 0,
        markupPercentage: toNum(row.markupPercentage) ?? 0,
      };
      if (row.presentationId) {
        await firstValueFrom(this.productsService.updatePresentation(productId, row.presentationId, request));
        presentationIds.push(row.presentationId);
      } else {
        presentationIds.push(await firstValueFrom(this.productsService.createPresentation(productId, request)));
      }
    }

    // Precio de compra por presentación, contra la primera lista y moneda activas.
    const priceList = this.priceLists()[0];
    const currency = this.currencies()[0];
    if (!priceList || !currency || rows.length === 0) return;

    await firstValueFrom(
      this.productsService.setPrices(
        productId,
        rows.map((row, index) => ({
          presentationId: presentationIds[index],
          priceListId: priceList.id,
          currencyId: currency.id,
          purchasePrice: toNum(row.purchasePrice),
          salePrice: null,
        })),
      ),
    );
  }
}
