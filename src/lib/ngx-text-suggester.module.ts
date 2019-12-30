import { NgModule } from "@angular/core";
import { NgxTextSuggesterComponent } from "./ngx-text-suggester.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HighlightJsModule } from "ngx-highlight-js";

@NgModule({
  declarations: [NgxTextSuggesterComponent],
  imports: [HighlightJsModule, CommonModule, FormsModule],
  exports: [NgxTextSuggesterComponent]
})
export class NgxTextSuggesterModule {}
