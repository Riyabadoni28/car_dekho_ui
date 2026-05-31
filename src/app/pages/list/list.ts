import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { CarCard, CarFilters, FilterOptions } from './car.model';
import { CarDataService } from './car-data.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './list.html',
  styleUrls: ['./list.scss'],
})
export class List {
  readonly pageSize = 6;
  readonly filterOptions = signal<FilterOptions>({
    makes: [],
    models: [],
    variants: [],
    prices: [],
    specs: [],
    mileage: [],
    safetyRating: [],
    userReviews: []
  });

readonly selectedFilters = signal<CarFilters>({
  make: null,
  model: null,
  variant: null,
  price: null,
  specs: null,
  mileage: null,
  safetyRating: null,
  userReview: null
});

  readonly cars = signal<CarCard[]>([]);
  readonly loading = signal(false);
  readonly totalCars = signal(0);
  readonly pageIndex = signal(0);

  constructor(private readonly carData: CarDataService) {
    this.loadFilterOptions();
    this.loadCars();
  }

  loadFilterOptions(): void {
    this.carData.getFilterOptions().subscribe((options) => this.filterOptions.set(options));
  }

loadCars(): void {
  this.loading.set(true);

  this.carData
    .getCars(this.selectedFilters(), this.pageIndex(), this.pageSize)
    .subscribe({
      next: (response) => {
        console.log('data',response)
        this.cars.set(response?.data ?? []);
        this.totalCars.set(response?.total ?? 0);
        this.loading.set(false);
      },
      error: () => {
        this.cars.set([]);
        this.totalCars.set(0);
        this.loading.set(false);
      }
    });
}

  applyFilters(): void {
    this.pageIndex.set(0);
    this.loadCars();
  }

  setFilter(field: keyof CarFilters, value: string | null): void {
    this.selectedFilters.update((filters) => ({
      ...filters,
      [field]: value
    }));
  }

  removeFilter(field: keyof CarFilters): void {
    this.selectedFilters.update((filters) => ({
      ...filters,
      [field]: null
    }));
    this.pageIndex.set(0);
    this.loadCars();
  }

  clearFilters(): void {
    this.selectedFilters.set({
      make: null,
      model: null,
      variant: null,
      price: null,
      specs: null,
      mileage: null,
      safetyRating: null,
      userReview: null
    });
    this.pageIndex.set(0);
    this.loadCars();
  }

  previousPage(): void {
    if (this.pageIndex() > 0) {
      this.pageIndex.update((value) => value - 1);
      this.loadCars();
    }
  }

  nextPage(): void {
    const maxIndex = Math.floor((this.totalCars() - 1) / this.pageSize);
    if (this.pageIndex() < maxIndex) {
      this.pageIndex.update((value) => value + 1);
      this.loadCars();
    }
  }

  get appliedFilters(): Array<{ field: keyof CarFilters; label: string; value: string }> {
    return Object.entries(this.selectedFilters())
      .filter(([, value]) => !!value)
      .map(([key, value]) => ({
        field: key as keyof CarFilters,
        label: this.labelForFilter(key),
        value: value as string
      }));
  }

  private labelForFilter(key: string): string {
    const labels: Record<string, string> = {
      make: 'Make',
      model: 'Model',
      variant: 'Variant',
      price: 'Price',
      specs: 'Specs',
      mileage: 'Mileage',
      safetyRating: 'Safety',
      userReview: 'Review'
    };
    return labels[key] ?? key;
  }
}
