import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SidebarDirective } from './sidebar.directive';

@Component({ template: '<button appSidebar>Navigation</button>' })
class SidebarHostComponent {}

// The former layout component is commented-out code. Exercise the surviving directive.
describe('SidebarDirective', () => {
  it('toggles its open class on successive activations', async () => {
    await TestBed.configureTestingModule({ declarations: [SidebarHostComponent, SidebarDirective] }).compileComponents();
    const fixture = TestBed.createComponent(SidebarHostComponent);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.classList.contains('is-open')).toBeFalse();
    button.click();
    fixture.detectChanges();
    expect(button.classList.contains('is-open')).toBeTrue();
    button.click();
    fixture.detectChanges();
    expect(button.classList.contains('is-open')).toBeFalse();
  });
});
