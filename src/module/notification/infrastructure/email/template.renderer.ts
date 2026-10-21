
import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { join, resolve, sep } from 'node:path';
import { renderFile } from 'pug';

@Injectable()
export class TemplateRenderer {
  private readonly templateRoot = resolve(
    process.cwd(),
    'templates',
    'email',
  );

  async render(
    templateName: string,
    data: Record<string, unknown>,
  ): Promise<string> {
    // Only accept a template filename, not an arbitrary path.
    if (
      !/^[a-zA-Z0-9_-]+\.pug$/.test(templateName)
    ) {
      throw new Error('Invalid email template name');
    }

    const templatePath = resolve(
      this.templateRoot,
      templateName,
    );

    // Ensure the resolved file remains inside the template directory.
    if (!templatePath.startsWith(this.templateRoot + sep)) {
      throw new Error('Invalid template path');
    }

    try {
      return await renderFile(templatePath, data);
    } catch {
      throw new InternalServerErrorException(
        `Failed to render email template: ${templateName}`,
      );
    }
  }
}