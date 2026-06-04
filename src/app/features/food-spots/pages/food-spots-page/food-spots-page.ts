import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { filter, switchMap } from 'rxjs';
import { MEAL_TYPE_LABELS, type MealType } from '../../../../core/models';
import { FOOD_SPOT_REPOSITORY } from '../../../../core/tokens/repository.tokens';
import { TripContextService } from '../../../../core/services/trip-context.service';
import { MockAuthService } from '../../../../data/mock/mock-auth.service';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-food-spots-page',
  standalone: true,
  imports: [FormsModule, PageHeader, EmptyState],
  templateUrl: './food-spots-page.html',
  styleUrl: './food-spots-page.scss',
})
export class FoodSpotsPage {
  readonly ctx = inject(TripContextService);
  private readonly food = inject(FOOD_SPOT_REPOSITORY);
  private readonly auth = inject(MockAuthService);

  readonly mealLabels = MEAL_TYPE_LABELS;
  readonly mealTypes = Object.keys(MEAL_TYPE_LABELS) as MealType[];
  filterMeal = signal<MealType | 'all'>('all');
  showForm = signal(false);

  name = '';
  area = '';
  notes = '';
  mealType: MealType = 'any';

  readonly spots = toSignal(
    toObservable(this.ctx.tripId).pipe(
      filter((id): id is string => !!id),
      switchMap((id) => this.food.list(id)),
    ),
    { initialValue: [] },
  );

  readonly filtered = computed(() => {
    const f = this.filterMeal();
    const list = this.spots();
    if (f === 'all') return list;
    return list.filter((s) => s.mealType === f || s.mealType === 'any');
  });

  add(): void {
    const tripId = this.ctx.tripId();
    const user = this.auth.currentUser();
    if (!tripId || !user || !this.name.trim()) return;
    this.food
      .create({
        tripId,
        name: this.name.trim(),
        area: this.area || undefined,
        notes: this.notes || undefined,
        mealType: this.mealType,
        addedBy: user.id,
        addedByName: user.displayName,
      })
      .subscribe(() => {
        this.showForm.set(false);
        this.name = '';
      });
  }

  toggleTried(id: string): void {
    const user = this.auth.currentUser();
    if (!user) return;
    this.food.toggleTried(id, user.id).subscribe();
  }

  tried(spot: { triedBy: string[] }): boolean {
    const user = this.auth.currentUser();
    return user ? spot.triedBy.includes(user.id) : false;
  }
}
