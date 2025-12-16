package com.booking.service;

import com.booking.dto.resource.ResourceRequest;
import com.booking.dto.resource.ResourceResponse;
import com.booking.entity.Resource;
import com.booking.exception.BookingException;
import com.booking.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public List<ResourceResponse> getActiveResources() {
        return resourceRepository.findByActiveTrue()
                .stream()
                .map(ResourceResponse::from)
                .toList();
    }

    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findAllByOrderByNameAsc()
                .stream()
                .map(ResourceResponse::from)
                .toList();
    }

    public ResourceResponse getResourceById(UUID id) {
        Resource resource = findResourceById(id);
        return ResourceResponse.from(resource);
    }

    @Transactional
    public ResourceResponse createResource(ResourceRequest request) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .description(request.getDescription())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        resource = resourceRepository.save(resource);
        log.info("Resource created: {} ({})", resource.getName(), resource.getId());

        return ResourceResponse.from(resource);
    }

    @Transactional
    public ResourceResponse updateResource(UUID id, ResourceRequest request) {
        Resource resource = findResourceById(id);

        resource.setName(request.getName());
        resource.setDescription(request.getDescription());
        if (request.getActive() != null) {
            resource.setActive(request.getActive());
        }

        resource = resourceRepository.save(resource);
        log.info("Resource updated: {} ({})", resource.getName(), resource.getId());

        return ResourceResponse.from(resource);
    }

    public Resource findResourceById(UUID id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> BookingException.notFound("Resource", id));
    }
}
