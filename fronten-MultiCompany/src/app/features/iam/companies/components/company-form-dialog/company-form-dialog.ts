import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiError } from '@/app/core/http/api-error';
import { LookupService } from '@/app/core/services/lookup.service';
import { ButtonDirective } from '@/app/shared/ui/directives/button.directive';
import { CheckboxDirective } from '@/app/shared/ui/directives/checkbox.directive';
import { LabelDirective } from '@/app/shared/ui/directives/label.directive';
import { Dialog } from '@/app/shared/ui/dialog/dialog';
import { Input } from '@/app/shared/ui/input/input';
import { TAXPAYER_TYPE } from '../../models/company.model';
import { CompaniesService } from '../../services/companies.service';

type CompanyTab = 'generales' | 'facturacion' | 'certificado' | 'administrador' | 'branding';

const TABS: { key: CompanyTab; label: string }[] = [
  { key: 'generales', label: 'Generales' },
  { key: 'facturacion', label: 'Facturación' },
  { key: 'certificado', label: 'Certificado' },
  { key: 'administrador', label: 'Administrador' },
  { key: 'branding', label: 'Branding' },
];

function urlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    try {
      new URL(control.value);
      return null;
    } catch {
      return { url: true };
    }
  };
}

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

@Component({
  selector: 'app-company-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, Dialog, ButtonDirective, Input, LabelDirective, CheckboxDirective],
  templateUrl: './company-form-dialog.html',
})
export class CompanyFormDialog {
  readonly open = input(false);
  readonly companyId = input<string | null>(null);

  readonly openChange = output<boolean>();
  readonly saved = output<void>();

  private readonly fb = inject(FormBuilder);
  private readonly companiesService = inject(CompaniesService);
  private readonly lookupService = inject(LookupService);

  protected readonly TAXPAYER_TYPE = TAXPAYER_TYPE;
  protected readonly tabs = TABS;
  protected readonly isEdit = computed(() => this.companyId() !== null);
  protected readonly activeTab = signal<CompanyTab>('generales');
  protected readonly saving = signal(false);
  protected readonly rucLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
    legalName: [''],
    logoUrl: [''],
    email: ['', [Validators.email]],
    phone: [''],
    website: ['', [urlValidator()]],
    address: [''],
    taxId: [''],
    taxAddress: [''],
    economicActivity: [''],
    taxpayerType: this.fb.nonNullable.control<number>(TAXPAYER_TYPE.PERSONA_JURIDICA, [Validators.required]),
    accountingRequired: [false],
    settlementCurrency: ['PEN', [Validators.required, Validators.minLength(3), Validators.maxLength(3)]],
    solUser: [''],
    solPassword: [''],
    certificatePassword: [''],
    certificateFileName: [''],
    certificateContent: [''],
    adminFullName: [''],
    adminEmail: ['', [Validators.email]],
    adminPassword: [''],
  });

  constructor() {
    effect(() => {
      if (this.open()) void this.initializeForm();
    });
  }

  private async initializeForm(): Promise<void> {
    const id = this.companyId();
    const editing = id !== null;

    this.errorMessage.set(null);
    this.activeTab.set('generales');
    this.form.reset({
      name: '',
      slug: '',
      legalName: '',
      logoUrl: '',
      email: '',
      phone: '',
      website: '',
      address: '',
      taxId: '',
      taxAddress: '',
      economicActivity: '',
      taxpayerType: TAXPAYER_TYPE.PERSONA_JURIDICA,
      accountingRequired: false,
      settlementCurrency: 'PEN',
      solUser: '',
      solPassword: '',
      certificatePassword: '',
      certificateFileName: '',
      certificateContent: '',
      adminFullName: '',
      adminEmail: '',
      adminPassword: '',
    });

    if (editing) {
      this.form.controls.adminEmail.clearValidators();
      this.form.controls.adminPassword.clearValidators();
    } else {
      this.form.controls.adminEmail.setValidators([Validators.required, Validators.email]);
      this.form.controls.adminPassword.setValidators([Validators.required, Validators.minLength(8)]);
    }
    this.form.controls.adminEmail.updateValueAndValidity();
    this.form.controls.adminPassword.updateValueAndValidity();

    if (editing) {
      try {
        const company = await firstValueFrom(this.companiesService.getCompany(id));
        this.form.patchValue({
          name: company.name,
          slug: company.slug,
          legalName: company.legalName ?? '',
          logoUrl: company.logoUrl ?? '',
          email: company.email ?? '',
          phone: company.phone ?? '',
          website: company.website ?? '',
          address: company.address ?? '',
          taxId: company.taxId ?? '',
          taxAddress: company.taxAddress ?? '',
          economicActivity: company.economicActivity ?? '',
          taxpayerType: company.taxpayerType,
          accountingRequired: company.accountingRequired,
          settlementCurrency: company.settlementCurrency,
        });
      } catch (error) {
        this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudo cargar la empresa.');
      }
    }
  }

  protected setTab(tab: CompanyTab): void {
    this.activeTab.set(tab);
  }

  protected async onBuscarRuc(): Promise<void> {
    const ruc = this.form.controls.taxId.value.trim();
    if (!ruc) {
      this.errorMessage.set('Ingresa un RUC para consultar.');
      return;
    }

    this.errorMessage.set(null);
    this.rucLoading.set(true);
    try {
      const data = await firstValueFrom(this.lookupService.lookupRuc(ruc));
      this.form.patchValue({
        legalName: data.razonSocial,
        name: this.form.controls.name.value || data.nombreComercial || data.razonSocial,
        taxAddress: data.direccion || this.form.controls.taxAddress.value,
      });
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudo consultar el RUC.');
    } finally {
      this.rucLoading.set(false);
    }
  }

  protected onCertificateFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      this.form.patchValue({ certificateContent: base64, certificateFileName: file.name });
    };
    reader.readAsDataURL(file);
  }

  protected onLogoFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.form.patchValue({ logoUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  protected removeLogo(): void {
    this.form.patchValue({ logoUrl: '' });
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.saving.set(true);

    const raw = this.form.getRawValue();
    const base = {
      name: raw.name,
      slug: raw.slug,
      legalName: emptyToNull(raw.legalName),
      logoUrl: raw.logoUrl || null,
      email: emptyToNull(raw.email),
      phone: emptyToNull(raw.phone),
      website: emptyToNull(raw.website),
      address: emptyToNull(raw.address),
      taxId: emptyToNull(raw.taxId),
      taxAddress: emptyToNull(raw.taxAddress),
      economicActivity: emptyToNull(raw.economicActivity),
      taxpayerType: raw.taxpayerType,
      accountingRequired: raw.accountingRequired,
      settlementCurrency: raw.settlementCurrency,
      solUser: emptyToNull(raw.solUser),
      solPassword: emptyToNull(raw.solPassword),
      certificatePassword: emptyToNull(raw.certificatePassword),
      certificateFileName: emptyToNull(raw.certificateFileName),
      certificateContent: emptyToNull(raw.certificateContent),
    };

    const id = this.companyId();

    try {
      if (id !== null) {
        await firstValueFrom(this.companiesService.updateCompany(id, base));
      } else {
        await firstValueFrom(
          this.companiesService.createCompany({
            ...base,
            adminEmail: raw.adminEmail || null,
            adminFullName: emptyToNull(raw.adminFullName),
            adminPassword: raw.adminPassword ? raw.adminPassword : null,
          }),
        );
      }
      this.saved.emit();
      this.openChange.emit(false);
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudo guardar la empresa.');
    } finally {
      this.saving.set(false);
    }
  }
}
