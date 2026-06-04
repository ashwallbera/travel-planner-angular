import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { CompanionBreakdown } from '../../../../core/models';
import { validateCompanions } from '../../../../core/utils/companion.validator';

@Component({
  selector: 'app-companion-breakdown',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './companion-breakdown.html',
  styleUrl: './companion-breakdown.scss',
})
export class CompanionBreakdownComponent {
  readonly travelerCount = input.required<number>();
  readonly companions = model.required<CompanionBreakdown>();

  validationMessage(): string | undefined {
    return validateCompanions(this.companions(), this.travelerCount()).message;
  }

  isValid(): boolean {
    return validateCompanions(this.companions(), this.travelerCount()).valid;
  }

  patch(key: keyof CompanionBreakdown, value: number): void {
    this.companions.update((c) => ({ ...c, [key]: Number(value) }));
  }
}
