# analytics-sdk-angular

> Angular service wrapper for the Analytics SDK with dependency injection and RxJS support

[![npm version](https://img.shields.io/npm/v/analytics-sdk-angular.svg)](https://www.npmjs.com/package/analytics-sdk-angular)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎯 **Angular service** with dependency injection
- 🔄 **RxJS observables** for reactive programming
- 🚀 **Module Federation** ready
- 📝 **Full TypeScript** support
- 🛡️ **Type-safe** event tracking

## Installation

```bash
npm install analytics-sdk-angular analytics-sdk-core
```

## Quick Start

### 1. Import the Module

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AnalyticsModule } from 'analytics-sdk-angular';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AnalyticsModule.forRoot({
      configUrl: 'https://api.example.com/analytics-config',
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### 2. Use in Components

```typescript
import { Component } from '@angular/core';
import { AnalyticsService } from 'analytics-sdk-angular';

@Component({
  selector: 'app-checkout',
  template: ` <button (click)="onCheckout()">Checkout</button> `,
})
export class CheckoutComponent {
  constructor(private analytics: AnalyticsService) {}

  onCheckout() {
    this.analytics.track('checkout_clicked', {
      cart_value: 99.99,
      items_count: 3,
    });
  }
}
```

## API Reference

### AnalyticsService

#### `track(event: string | AnalyticsEvent, properties?: Record<string, any>): void`

Track a custom event.

```typescript
this.analytics.track('button_click', { button_id: 'signup' });
```

#### `identify(userId: string, traits?: Record<string, any>): void`

Identify a user with traits.

```typescript
this.analytics.identify('user_123', {
  email: 'user@example.com',
  plan: 'premium',
});
```

#### `page(name?: string, properties?: Record<string, any>): void`

Track a page view.

```typescript
this.analytics.page('Home Page', { section: 'landing' });
```

#### `initialized$: Observable<boolean>`

Observable that emits when the SDK is initialized.

```typescript
this.analytics.initialized$.subscribe((initialized) => {
  console.log('SDK initialized:', initialized);
});
```

## Module Configuration

```typescript
AnalyticsModule.forRoot({
  configUrl: 'https://api.example.com/analytics-config',
  // Optional: custom providers
  providers: [new CustomAnalyticsProvider()],
});
```

## Router Integration

Track page views automatically on route changes:

```typescript
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

constructor(
  private router: Router,
  private analytics: AnalyticsService
) {
  this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe((event: NavigationEnd) => {
    this.analytics.page(event.urlAfterRedirects);
  });
}
```

## Module Federation Setup

```typescript
// webpack.config.js
new ModuleFederationPlugin({
  shared: {
    'analytics-sdk-core': {
      singleton: true,
      strictVersion: true,
      requiredVersion: '^1.0.0',
    },
    'analytics-sdk-angular': {
      singleton: true,
      strictVersion: true,
      requiredVersion: '^1.0.0',
    },
  },
});
```

## License

MIT
