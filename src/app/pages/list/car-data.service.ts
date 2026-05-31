import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CAR_FILTERS } from './car-filters.constants';
import { CarCard, CarFilters, FilterOptions } from './car.model'

export interface CarApiResponse {
  data: CarCard[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CarDataService {
  private readonly baseUrl = 'https://car-dekho-api-1.vercel.app/api/cars';

  constructor(private readonly http: HttpClient) {}

  /**
   * FILTER OPTIONS from CONST file
   */
  getFilterOptions(): Observable<FilterOptions> {
    return of({
      makes: [...CAR_FILTERS.makes],
      models: [...CAR_FILTERS.models],
      variants: [...CAR_FILTERS.variants],
      prices: [...CAR_FILTERS.prices],
      specs: [...CAR_FILTERS.specs],
      mileage: [...CAR_FILTERS.mileage],
      safetyRating: [...CAR_FILTERS.safetyRating],
      userReviews: [...CAR_FILTERS.userReviews]
    });
  }

  /**
   * CAR LIST from BACKEND API
   */
  getCars(
    filters: CarFilters,
    pageIndex: number,
    pageSize: number
  ): Observable<CarApiResponse> {

    let params = new HttpParams()
      .set('page', pageIndex)
      .set('limit', pageSize);

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params = params.set(key, value);
      }
    });

    return this.http.get<CarApiResponse>(this.baseUrl, { params });
  }
}