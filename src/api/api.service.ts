import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class ApiService {
    constructor(
        private readonly authService: AuthService
    ) {

    }
}
