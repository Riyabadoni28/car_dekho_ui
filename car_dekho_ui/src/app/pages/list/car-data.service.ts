import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, delay, map, Observable, of, shareReplay } from 'rxjs';

export interface CarFilters {
  make: string | null;
  model: string | null;
  variant: string | null;
  price: string | null;
  specs: string | null;
  mileage: string | null;
  safetyRating: string | null;
  userReview: string | null;
}

export interface FilterOptions {
  makes: string[];
  models: string[];
  variants: string[];
  prices: string[];
  specs: string[];
  mileage: string[];
  safetyRating: string[];
  userReviews: string[];
}

export interface CarCard {
  id: number;
  make: string;
  model: string;
  variant: string;
  price: string;
  specs: string;
  mileage: string;
  safetyRating: string;
  userReview: string;
  images: string[];
}

interface CarApiResponse {
  filters: FilterOptions;
  cars: CarCard[];
}

interface CarListResponse {
  cars: CarCard[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarDataService {
  private readonly dataUrl = '/assets/cars.json';
  private readonly carsUrl = '/assets/cars.json';

  private readonly fallbackData: CarApiResponse = {
    filters: {
      makes: ['Toyota', 'Hyundai', 'Maruti Suzuki', 'Kia', 'Mahindra'],
      models: ['Fortuner', 'Creta', 'Swift', 'Seltos', 'Thar'],
      variants: ['Base', 'Mid', 'Premium', 'Sport', 'Top'],
      prices: ['< 10L', '10L - 20L', '20L - 30L', '30L - 40L', '> 40L'],
      specs: ['Petrol', 'Diesel', 'Hybrid', 'Electric'],
      mileage: ['10-15 kmpl', '15-20 kmpl', '20-25 kmpl', '25+ kmpl'],
      safetyRating: ['3 Star', '4 Star', '5 Star'],
      userReviews: ['Excellent', 'Good', 'Average', 'Below Average']
    },
    cars: [
      {
        id: 1,
        make: 'Toyota',
        model: 'Fortuner',
        variant: 'Premium',
        price: '35L',
        specs: 'Diesel',
        mileage: '12 kmpl',
        safetyRating: '5 Star',
        userReview: 'Excellent',
        images: ['https://via.placeholder.com/520x320?text=Fortuner']
      },
      {
        id: 2,
        make: 'Hyundai',
        model: 'Creta',
        variant: 'Sport',
        price: '18L',
        specs: 'Petrol',
        mileage: '16 kmpl',
        safetyRating: '4 Star',
        userReview: 'Good',
        images: ['https://via.placeholder.com/520x320?text=Creta']
      },
      {
        id: 3,
        make: 'Maruti Suzuki',
        model: 'Swift',
        variant: 'Base',
        price: '8L',
        specs: 'Petrol',
        mileage: '22 kmpl',
        safetyRating: '4 Star',
        userReview: 'Good',
        images: ['https://via.placeholder.com/520x320?text=Swift']
      },
      {
        id: 4,
        make: 'Kia',
        model: 'Seltos',
        variant: 'Top',
        price: '22L',
        specs: 'Hybrid',
        mileage: '18 kmpl',
        safetyRating: '5 Star',
        userReview: 'Excellent',
        images: ['https://via.placeholder.com/520x320?text=Seltos']
      },
      {
        id: 5,
        make: 'Mahindra',
        model: 'Thar',
        variant: 'Mid',
        price: '15L',
        specs: 'Diesel',
        mileage: '14 kmpl',
        safetyRating: '4 Star',
        userReview: 'Average',
        images: ['https://via.placeholder.com/520x320?text=Thar']
      }
    ]
  };

  constructor(private readonly http: HttpClient) {}

  private get data$(): Observable<CarApiResponse> {
    return this.http.get<CarApiResponse>(this.dataUrl).pipe(
      catchError(() => of(this.fallbackData)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getFilterOptions(): Observable<FilterOptions> {
    return this.data$.pipe(map((data) => data.filters), delay(100));
  }

  getCars(filters: CarFilters, page: number, pageSize: number): Observable<{ cars: CarCard[]; total: number }> {
    const params = new HttpParams({ fromObject: this.buildQueryParams(filters, page, pageSize) });

    return this.http
      .get<CarListResponse | CarApiResponse>(this.carsUrl, { params })
      .pipe(
        map((response) => this.normalizeCarsResponse(response, filters, page, pageSize)),
        catchError(() => of(this.getFallbackCars(filters, page, pageSize))),
        delay(150),
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  private normalizeCarsResponse(
    response: CarListResponse | CarApiResponse,
    filters: CarFilters,
    page: number,
    pageSize: number
  ): { cars: CarCard[]; total: number } {
    if ('total' in response && typeof response.total === 'number') {
      return response;
    }

    if ('cars' in response) {
      return this.getFallbackCars(filters, page, pageSize);
    }

    return { cars: [], total: 0 };
  }

  private buildQueryParams(filters: CarFilters, page: number, pageSize: number): Record<string, string> {
    const params: Record<string, string> = {
      page: String(page),
      pageSize: String(pageSize)
    };

    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        params[key] = value;
      }
    }

    return params;
  }

  private getFallbackCars(filters: CarFilters, page: number, pageSize: number): { cars: CarCard[]; total: number } {
    const filteredCars = this.fallbackData.cars.filter((car) => this.matchesFilters(car, filters));
    const start = page * pageSize;
    return {
      cars: filteredCars.slice(start, start + pageSize),
      total: filteredCars.length
    };
  }

  private matchesFilters(car: CarCard, filters: CarFilters): boolean {
    const carPriceValue = Number(car.price.replace(/[^0-9]/g, ''));
    const carMileageValue = Number(car.mileage.replace(/[^0-9]/g, ''));

    return (
      (!filters.make || car.make === filters.make) &&
      (!filters.model || car.model === filters.model) &&
      (!filters.variant || car.variant === filters.variant) &&
      (!filters.price || this.matchesPriceFilter(filters.price, carPriceValue)) &&
      (!filters.specs || car.specs === filters.specs) &&
      (!filters.mileage || this.matchesMileageFilter(filters.mileage, carMileageValue)) &&
      (!filters.safetyRating || car.safetyRating === filters.safetyRating) &&
      (!filters.userReview || car.userReview === filters.userReview)
    );
  }

  private matchesPriceFilter(priceFilter: string, priceValue: number): boolean {
    if (priceFilter === '< 10L') {
      return priceValue < 10;
    }
    if (priceFilter === '10L - 20L') {
      return priceValue >= 10 && priceValue <= 20;
    }
    if (priceFilter === '20L - 30L') {
      return priceValue > 20 && priceValue <= 30;
    }
    if (priceFilter === '30L - 40L') {
      return priceValue > 30 && priceValue <= 40;
    }
    return priceFilter === '> 40L' ? priceValue > 40 : false;
  }

  private matchesMileageFilter(mileageFilter: string, mileageValue: number): boolean {
    if (mileageFilter === '10-15 kmpl') {
      return mileageValue >= 10 && mileageValue <= 15;
    }
    if (mileageFilter === '15-20 kmpl') {
      return mileageValue > 15 && mileageValue <= 20;
    }
    if (mileageFilter === '20-25 kmpl') {
      return mileageValue > 20 && mileageValue <= 25;
    }
    return mileageFilter === '25+ kmpl' ? mileageValue >= 25 : false;
  }
}
