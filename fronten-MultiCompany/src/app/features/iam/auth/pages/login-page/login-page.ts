import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideRocket, LucideShieldCheck } from '@lucide/angular';
import { firstValueFrom } from 'rxjs';
import { STORAGE_KEYS } from '@/app/core/constants/storage-keys';
import { ApiError } from '@/app/core/http/api-error';
import { AuthState } from '@/app/core/state/auth.state';
import { zodFieldValidator } from '@/app/shared/forms/zod-validator';
import { ButtonDirective } from '@/app/shared/ui/directives/button.directive';
import { CheckboxDirective } from '@/app/shared/ui/directives/checkbox.directive';
import { InputDirective } from '@/app/shared/ui/directives/input.directive';
import { LabelDirective } from '@/app/shared/ui/directives/label.directive';
import { getTenantSlug } from '../../lib/tenant';
import { loginSchema } from '../../models/login.schema';
import { AuthService } from '../../services/auth.service';
import { BrandingService, type CompanyBranding } from '../../services/branding.service';

function rememberedEmail(): string {
  if (typeof localStorage === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEYS.REMEMBER_EMAIL) ?? '';
}

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LucideRocket,
    LucideShieldCheck,
    ButtonDirective,
    InputDirective,
    LabelDirective,
    CheckboxDirective,
  ],
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly brandingService = inject(BrandingService);
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);

  protected readonly tenantSlug = getTenantSlug();
  protected readonly isPending = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly forgotPasswordMessage = signal<string | null>(null);
  protected readonly branding = signal<CompanyBranding | null>(null);
  protected readonly remember = signal(Boolean(rememberedEmail()));
  protected readonly currentYear = new Date().getFullYear();

  // Marca a mostrar: la de la empresa (por subdominio) o la del dueño de la plataforma.
  protected readonly isTenant = computed(() => this.branding() !== null);
  protected readonly brandName = computed(() => this.branding()?.name ?? 'BRAVIC SYSTEMS');
  protected readonly brandLogo = computed(() => this.branding()?.logoUrl ?? '/bravic-logo.png');

  protected readonly form = this.fb.nonNullable.group({
    email: [rememberedEmail(), [Validators.required, zodFieldValidator(loginSchema.shape.email)]],
    password: ['', [Validators.required]],
  });

  constructor() {
    if (this.tenantSlug) {
      this.brandingService.getBySlug(this.tenantSlug).subscribe({
        next: (branding) => this.branding.set(branding),
        error: () => {
          // Sin branding para ese slug: se mantiene la marca del dueño de la plataforma.
        },
      });
    }
  }

  protected toggleRemember(checked: boolean): void {
    this.remember.set(checked);
  }

  protected showForgotPasswordHelp(): void {
    this.forgotPasswordMessage.set('Contacta al administrador para restablecer tu contraseña.');
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isPending.set(true);

    const { email, password } = this.form.getRawValue();

    if (this.remember()) localStorage.setItem(STORAGE_KEYS.REMEMBER_EMAIL, email);
    else localStorage.removeItem(STORAGE_KEYS.REMEMBER_EMAIL);

    try {
      const tokens = await firstValueFrom(this.authService.login({ email, password, slug: this.tenantSlug }));
      this.authState.setSession(tokens);
      this.authState.setCompanySlug(this.tenantSlug);

      const [me, permissions] = await Promise.all([
        firstValueFrom(this.authService.getMe()),
        firstValueFrom(this.authService.getMyPermissions()),
      ]);
      this.authState.setUser(me);
      this.authState.setPermissions(permissions);

      await this.router.navigateByUrl('/');
    } catch (error) {
      this.errorMessage.set(error instanceof ApiError ? error.message : 'No se pudo iniciar sesión.');
    } finally {
      this.isPending.set(false);
    }
  }
}
