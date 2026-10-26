
package com.campusConnect.demo;

import java.util.Locale;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder,JwtService jwtService) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(
            @Valid @RequestBody SignupRequest request) {

        String email = request.getEmail().trim()
                .toLowerCase(Locale.ROOT);

        if (studentRepository.existsByEmail(email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("An account with this email already exists.");
        }

        Student student = new Student(
                request.getName().trim(),
                email,
                passwordEncoder.encode(request.getPassword())
        );

        Student savedStudent = studentRepository.save(student);

        SignupResponse response = new SignupResponse(
                savedStudent.getId(),
                savedStudent.getName(),
                savedStudent.getEmail(),
                "Student account created successfully."
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
@PostMapping("/login")
public ResponseEntity<LoginResponse> login(
        @Valid @RequestBody LoginRequest request) {

    String email = request.getEmail().trim()
            .toLowerCase(Locale.ROOT);

    Student student = studentRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"));

    if (!passwordEncoder.matches(
            request.getPassword(), student.getPassword())) {
        throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password");
    }
    String token = jwtService.generateToken(student);

    LoginResponse response = new LoginResponse(
            student.getId(),
            student.getName(),
            student.getEmail(),
            "Login successful",
            token
    );

    return ResponseEntity.ok(response);
}

@GetMapping("/me")
public ResponseEntity<?> getCurrentStudent(
        org.springframework.security.core.Authentication authentication) {

    String email = authentication.getName();

    Student student = studentRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Student account not found"));

    return ResponseEntity.ok(
            new SignupResponse(
                    student.getId(),
                    student.getName(),
                    student.getEmail(),
                    "Student details fetched successfully"
            )
    );
}


}

