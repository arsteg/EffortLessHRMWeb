import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-test-enquiry',
  standalone: true,
  imports: [],
  templateUrl: './test-enquiry.component.html',
  styleUrl: './test-enquiry.component.css'
})
export class TestEnquiryComponent implements OnInit {

  constructor(private renderer: Renderer2, @Inject(DOCUMENT) private document: Document) {}

  ngOnInit() {
    this.loadScript('https://www.google.com/recaptcha/api.js');
    this.loadScript('https://crm.zohopublic.in/crm/WebFormAnalyticsServeServlet?rid=91ab698abf42f1f25e9f61d07696fffdb4289a4be00b4627aedb35031fccab4889a605302080f0e2ffc0307eb84ce342gid1e6c76f8a49ef74e69eefaaaff9a9be3f4bd50632675cd8f1e013196d95aadc2gida9905cfa170c95d9327ad1257f4c872b38c1b97ce60ac3f27ea4caad170ce01bgid4b9b378f5f4f8f2c8e63345c427f77587f5469a5d1b4a2a98a7bdc6eea14579b&tw=fe1c31085d512d4d4d50e86157e453b34a805f3187667bcc0085519d9bd43e9a', 'wf_anal');

    (window as any).rccallback1233161000000742027 = this.rccallback.bind(this);
  }

  loadScript(src: string, id?: string) {
    if (id && this.document.getElementById(id)) return;
    const script = this.renderer.createElement('script');
    script.src = src;
    if (id) script.id = id;
    script.async = true;
    script.defer = true;
    this.renderer.appendChild(this.document.head, script);
  }

  addAriaSelected(event: any) {
    const optionElem = event.target as HTMLSelectElement;
    const previousSelectedOption = optionElem.querySelector('[aria-selected="true"]');
    if (previousSelectedOption) {
      this.renderer.removeAttribute(previousSelectedOption, 'aria-selected');
    }
    const selectedOption = optionElem.options[optionElem.selectedIndex];
    if (selectedOption) {
      this.renderer.setAttribute(selectedOption, 'aria-selected', 'true');
    }
  }

  rccallback() {
    const recap = this.document.getElementById('recap1233161000000742027');
    if (recap) {
      this.renderer.setAttribute(recap, 'captcha-verified', 'true');
    }
    const recapErr = this.document.getElementById('recapErr1233161000000742027');
    if (recapErr && recapErr.style.visibility === 'visible') {
      this.renderer.setStyle(recapErr, 'visibility', 'hidden');
    }
  }

  reCaptchaAlert() {
    const recap = this.document.getElementById('recap1233161000000742027');
    if (recap && recap.getAttribute('captcha-verified') === 'false') {
      const recapErr = this.document.getElementById('recapErr1233161000000742027');
      if (recapErr) this.renderer.setStyle(recapErr, 'visibility', 'visible');
      return false;
    }
    return true;
  }

  validateEmail() {
    const form = this.document.forms.namedItem('WebToLeads1233161000000742027') as HTMLFormElement;
    if (!form) return true;
    const emailFlds = form.querySelectorAll('[ftype="email"]');
    for (let i = 0; i < emailFlds.length; i++) {
        const emailInput = emailFlds[i] as HTMLInputElement;
        const emailVal = emailInput.value;
        if ((emailVal.replace(/^\s+|\s+$/g, '')).length !== 0) {
            const atpos = emailVal.indexOf('@');
            const dotpos = emailVal.lastIndexOf('.');
            if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= emailVal.length) {
                alert('Please enter a valid email address. ');
                emailInput.focus();
                return false;
            }
        }
    }
    return true;
  }

  checkMandatory(event: Event) {
    const form = this.document.forms.namedItem('WebToLeads1233161000000742027') as HTMLFormElement;
    if (!form) return true;
    
    const mndFileds = ['Company', 'Last Name', 'Email', 'Mobile', 'LEADCF2', 'LEADCF4', 'LEADCF5', 'LEADCF7'];
    const fldLangVal = ['Company', 'Last Name', 'Email', 'Mobile', 'Issue Description', 'Lead Source Channel', 'Urgency', 'Device Brand'];
    
    for (let i = 0; i < mndFileds.length; i++) {
      const fieldObj = form.elements.namedItem(mndFileds[i]) as HTMLInputElement | HTMLSelectElement;
      if (fieldObj) {
        if (((fieldObj.value).replace(/^\s+|\s+$/g, '')).length === 0) {
          if (fieldObj.type === 'file') {
            alert('Please select a file to upload.');
            fieldObj.focus();
            event.preventDefault();
            return false;
          }
          alert(fldLangVal[i] + ' cannot be empty.');
          fieldObj.focus();
          event.preventDefault();
          return false;
        } else if (fieldObj.nodeName === 'SELECT') {
          const selectObj = fieldObj as HTMLSelectElement;
          if (selectObj.options[selectObj.selectedIndex].value === '-None-') {
            alert(fldLangVal[i] + ' cannot be none.');
            selectObj.focus();
            event.preventDefault();
            return false;
          }
        } else if (fieldObj.type === 'checkbox') {
          const checkboxObj = fieldObj as HTMLInputElement;
          if (checkboxObj.checked === false) {
            alert('Please accept  ' + fldLangVal[i]);
            checkboxObj.focus();
            event.preventDefault();
            return false;
          }
        }
      }
    }
    
    if (!this.validateEmail()) {
      event.preventDefault();
      return false;
    }
    
    if (!this.reCaptchaAlert()) {
      event.preventDefault();
      return false;
    }
    
    const urlparams = new URLSearchParams(window.location.search);
    if (urlparams.has('service') && (urlparams.get('service') === 'smarturl')) {
      const service = urlparams.get('service');
      const smarturlfield = this.renderer.createElement('input');
      this.renderer.setAttribute(smarturlfield, 'type', 'hidden');
      this.renderer.setAttribute(smarturlfield, 'value', service || '');
      this.renderer.setAttribute(smarturlfield, 'name', 'service');
      this.renderer.appendChild(form, smarturlfield);
    }
    
    const submitBtn = this.document.querySelector('.crmWebToEntityForm .formsubmit') as HTMLInputElement;
    if (submitBtn) this.renderer.setAttribute(submitBtn, 'disabled', 'true');
    
    return true;
  }
}
